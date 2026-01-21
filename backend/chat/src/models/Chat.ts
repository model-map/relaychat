import mongoose, { Document, Schema, Types } from "mongoose";

export interface IChat extends Document {
  users: Types.ObjectId[];
  latestMessage: {
    text: string;
    sender: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema<IChat> = new Schema(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        required: true,
      },
    ],
    latestMessage: {
      text: String,
      sender: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.model<IChat>("Chat", ChatSchema);
