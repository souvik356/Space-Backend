import mongoose from "mongoose";

const { Schema } = mongoose;

const TaskSchema = new mongoose.Schema(
  {
    taskName: { type: String, required: true },
    description: String,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Done"],
      default: "To Do",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    attachments: [String],
  },
  { timestamps: true }
);

const TaskModel = mongoose.model("Task", TaskSchema);
export default TaskModel;
