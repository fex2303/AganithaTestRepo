import SampleController from "../controllers/sample.controller.js";

export default function routes(app){

const sampleController = new SampleController()


app.get("/test", sampleController.method);


}




