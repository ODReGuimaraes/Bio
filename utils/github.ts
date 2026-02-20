import { Octokit } from "@octokit/rest";
import { Buffer } from "buffer";

// Repository Configuration
// NOTE: Make sure these details match your repo exactly
export const REPO_OWNER = 'odreguimaraes';
export const REPO_NAME = 'Bio';
// The path in the repo where files will be stored.
// If using Vite/Create-React-App, 'public/uploads' means they will appear at '/Bio/uploads/' after build.
const UPLOAD_PATH = 'public/uploads';

export const uploadFileToGitHub = async (
  file: File,
  token: string
): Promise<string> => {
  const octokit = new Octokit({
    auth: token,
  });

  const content = await file.arrayBuffer();
  // base64 encoding using buffer for GitHub API
  const base64Content = Buffer.from(content).toString('base64');
  
  // Use file name but maybe sanitize or add timestamp to avoid collisions?
  // For now, sanitize spaces and special chars to ensure URL safety
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${UPLOAD_PATH}/${safeName}`;
  
  // Try to get existing file SHA to support updates
  let sha: string | undefined;
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
    });
    
    // safe check if it's not a directory
    if (data && !Array.isArray(data) && data.sha) {
      sha = data.sha;
    }
  } catch (error) {
    // If 404, file doesn't exist, proceed with creation
  }

  try {
    const result = await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      message: `Upload ${file.name} via Admin Dashboard`,
      content: base64Content,
      sha: sha, // Include SHA if updating
    });

    console.log(`File uploaded successfully: ${result.data.content?.html_url}`);

    // Return the deployed GitHub Pages URL
    // Format: https://<user>.github.io/<repo>/<path_relative_to_public>
    // Since we upload to `public/uploads`, the deployed URL is `uploads/<filename>`
    return `https://${REPO_OWNER}.github.io/${REPO_NAME}/uploads/${safeName}`;
  } catch (error) {
    console.error('Error uploading to GitHub:', error);
    throw error;
  }
};

export const uploadContentToGitHub = async (
  content: object,
  token: string,
  pendingUploads?: Map<string, File>
): Promise<void> => {
  const octokit = new Octokit({
    auth: token,
  });

  // Handle pending file uploads first
  if (pendingUploads && pendingUploads.size > 0) {
      console.log(`Processing ${pendingUploads.size} pending file uploads...`);
      for (const [itemId, file] of pendingUploads.entries()) {
          try {
              await uploadFileToGitHub(file, token);
              console.log(`Successfully uploaded pending file for item ${itemId}: ${file.name}`);
          } catch (error) {
              console.error(`Failed to upload pending file for item ${itemId}: ${file.name}`, error);
              // We might want to throw here to stop the whole process if a critical file fails
              // But for now, we continue so at least the JSON is updated and other files are uploaded
          }
      }
  }

  const jsonString = JSON.stringify(content, null, 2);
  const base64Content = Buffer.from(jsonString).toString('base64');
  const filePath = 'public/content.json';

  let sha: string | undefined;
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
    });
    
    if (data && !Array.isArray(data) && data.sha) {
      sha = data.sha;
    }
  } catch (error) {
    // File doesn't exist, proceed with creation
  }

  await octokit.repos.createOrUpdateFileContents({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path: filePath,
    message: `Update site content via Admin Dashboard`,
    content: base64Content,
    sha: sha, // Include SHA if updating
  });

  // Extract all file names that determine used files
  const usedFileNames = new Set<string>();
  const pages = (content as any).pages || [];
  
  pages.forEach((page: any) => {
    page.items?.forEach((item: any) => {
        if (item.url && typeof item.url === 'string') {
            // Check if it's a file uploaded to our repo
            if (item.url.includes(`${REPO_OWNER}.github.io/${REPO_NAME}/uploads/`)) {
                // Extract filename from URL - decodeURIComponent is important for spaces
                const fileName = decodeURIComponent(item.url.split('/uploads/')[1]);
                if (fileName) usedFileNames.add(fileName);
            }
        }
    });
  });

  // Fetch all files currently in public/uploads and delete unused ones
  try {
      const { data: remoteFiles } = await octokit.repos.getContent({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: UPLOAD_PATH,
      });

      if (Array.isArray(remoteFiles)) {
          // Iterate through all files in the remote folder
          for (const file of remoteFiles) {
              // Only consider files (not subdirectories) and check if they are NOT in use
              if (file.type === 'file' && !usedFileNames.has(file.name)) {
                  console.log(`Deleting unused file: ${file.name}`);
                  
                  // Delete the unused file
                  await octokit.repos.deleteFile({
                      owner: REPO_OWNER,
                      repo: REPO_NAME,
                      path: file.path,
                      message: `Delete unused file ${file.name} via Admin Dashboard cleanup`,
                      sha: file.sha,
                  });
              }
          }
      }
  } catch (error) {
      console.warn("Error cleaning up unused files (folder might be empty or other issue):", error);
      // We don't throw here to avoid breaking the main save operation if cleanup fails
  }
};

