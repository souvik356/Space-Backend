import mongoose from "mongoose";

const { Schema } = mongoose;

// Subdocument for Pipeline embedded inside Project
const PipelineSubSchema = new Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g., "Yas Chatbot"
    description: { type: String, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }], // tasks under this pipeline
  },
  { _id: true, timestamps: true }
);

const ProjectSchema = new Schema(
  {
    projectName: { type: String, required: true },
    spaceId: { type: Schema.Types.ObjectId, ref: "Space", required: true },
    description: { type: String, required: true },

    // NEW: pipelines as embedded subdocuments
    pipelines: [PipelineSubSchema],

    // keep project members (must all be in the space)
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],

    endDate: { type: Date },

    status: {
      type: String,
      enum: ["To Do", "In progress", "Done"],
      default: "To Do",
    },
  },
  { timestamps: true }
);

const ProjectModel = mongoose.model("Project", ProjectSchema);
export default ProjectModel;
