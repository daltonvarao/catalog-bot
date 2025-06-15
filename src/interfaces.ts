export interface TelegramFileResponse {
  ok: boolean;
  result: {
    file_path: string;
  };
}

export interface TelegramUpdate {
  update_id: number;
  message: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name: string;
      language_code: string;
    };
    chat: {
      id: number;
      first_name: string;
      last_name: string;
      type: "private" | "group" | "supergroup" | "channel";
    };
    date: number;
    photo: Array<{
      file_id: string;
      file_unique_id: string;
      file_size: number;
      width: number;
      height: number;
    }>;
    caption: string;
  };
}
