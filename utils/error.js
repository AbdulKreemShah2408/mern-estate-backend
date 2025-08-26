export const errorHandler=(statusCode,message="Something went wrong")=>{
    const error=new Error(message);
    error.statusCode=Number(statusCode);
    error.message=message
    return error;
};
export default errorHandler;