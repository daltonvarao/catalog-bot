import axios from "axios";
import { TelegramFileResponse } from "./interfaces";

export async function getFileUrl(
  token: string,
  fileId: string
): Promise<string> {
  const baseUrl =
    "https://api.telegram.org/bot<TOKEN>/getFile?file_id=<fileId>";

  const url = baseUrl.replace("<TOKEN>", token).replace("<fileId>", fileId);

  try {
    const response = await axios.get<TelegramFileResponse>(url);

    if (!response.data.ok) {
      throw new Error(
        `Failed to get file URL from Telegram API [fileName] [${fileId}]`
      );
    }
    const filePath = response.data.result.file_path;
    return filePath;
  } catch (error) {
    console.error(`Error fetching file URL: ${error}`);
    throw error;
  }
}

export async function getFileAndDownload(
  token: string,
  filePath: string
): Promise<any> {
  try {
    const baseUrl = "https://api.telegram.org/file/bot<TOKEN>/<filePath>";
    const url = baseUrl
      .replace("<TOKEN>", token)
      .replace("<filePath>", filePath);

    const response = await axios.get(url);

    console.log(response);
  } catch (error) {
    console.error(`Error fetching file: ${error}`);
    throw error;
  }
}
