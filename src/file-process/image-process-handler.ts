import { Handler, S3Event } from "aws-lambda";

export const imageProcess:Handler = async (event: S3Event)=>{
    console.log(event);
}