import express, { Request, Response } from "express";
import { TelegramUpdate } from "./interfaces";
import { getFileUrl } from "./utils";

const token = "8124494270:AAFeUuSnG5OwGNEEs2xLLkb_OZnDT4xLJ6s";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/catalog", async (req: Request, res: Response) => {
  const body: TelegramUpdate = req.body;

  console.log(body);

  if (body.message.photo?.length) {
    const lastPhoto = body.message.photo[body.message.photo.length - 1];

    if (lastPhoto) {
      const filePath = await getFileUrl(token, lastPhoto.file_id);
      console.log(`File URL: ${filePath}`);
      console.log(
        `File caption: ${body.message.caption || "No caption provided"}`
      );

      // const file = await getFileAndDownload(token, filePath);
      // console.log(`File downloaded successfully: ${file}`);
    }
  }

  res.status(200).json({
    message: "Catalog data received successfully",
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
