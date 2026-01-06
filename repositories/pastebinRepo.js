import pastebinSchema from "../models/pastebinSchema.js";
export default class OAOApplicantRepo {
    constructor() {
        this.pastebinSchema = pastebinSchema;
    }

    async insertNewObject(query) {
        try {
            return this.pastebinSchema.insertMany(query);
        } catch (error) {
            console.log(`Error in pastebinSchema:insertNewObject: ${error.message}`);
            return error;
        }
    }
    async findOneAndUpdate(filter, update, options) {
        try {
            const result = await this.pastebinSchema.findOneAndUpdate(filter, update, options).lean().exec();
            return result;
        } catch (error) {
            console.log(`Error in pastebinSchema:findOneAndUpdate: ${error.message}`);
            return error;
        }
    }

    async findOne(filter, project = {}) {
        try {
            return await this.pastebinSchema.findOne(filter, project).lean().exec();
        } catch (error) {
            console.log(`Error in pastebinSchema:findOne: ${error.message}`);
            return error;
        }
    }
}
