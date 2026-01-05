import sampleService  from "../services/sample.service.js";
import BaseController from "../system/base.controller.js";

export default class SampleController extends BaseController {
  constructor() {
    super()
    this.sampleService = new sampleService()
  }

  async method(req, res) {
    res.send(200)
    
  }
}