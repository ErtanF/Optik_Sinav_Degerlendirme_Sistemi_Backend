import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
    addOpticalTemplate,
    getOpticalTemplateById,
    getPublicOpticalTemplates,
    updateOpticalTemplate,
    deleteOpticalTemplate,
    getOpticalTemplatesByCreator,
    getOpticalTemplateComponents
} from "../controllers/opticaltemplate.controller.js";

const opticalTemplateRouter = express.Router();

opticalTemplateRouter.get("/creator", authenticateUser, getOpticalTemplatesByCreator);
opticalTemplateRouter.post("/", authenticateUser, addOpticalTemplate);
opticalTemplateRouter.get("/public", authenticateUser, getPublicOpticalTemplates);
opticalTemplateRouter.get("/:id", authenticateUser, getOpticalTemplateById);
opticalTemplateRouter.put("/:id", authenticateUser, updateOpticalTemplate);
opticalTemplateRouter.delete("/:id", authenticateUser, deleteOpticalTemplate);
opticalTemplateRouter.get("/:id/components", authenticateUser, getOpticalTemplateComponents);

export default opticalTemplateRouter;



