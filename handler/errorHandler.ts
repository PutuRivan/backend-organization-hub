import CustomError from "./CustomError";

const errorHandler = (err: any, req: any, res: any, next: any) => {
    // console.log(err);
    if (err instanceof CustomError) {
        return res.status(err.code).json({
            success: false,
            message: err.message
        })
    }
    return res.status(500).json({ message: err.message })
}

export default errorHandler;