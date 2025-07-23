export const createProjectController = async (req,res) => {
    try {
        // const {projectName,description}=req.body

    } catch (error) {
        return res.status(500).json({
            message:`${error || error.message}`,
            success: false,
            error: true
        })
    }
}