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
  token: string
): Promise<void> => {
  const octokit = new Octokit({
    auth: token,
  });

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
    sha: sha,
  });
};

