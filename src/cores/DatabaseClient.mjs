import pkg from "mongoose";
const { connect, Schema, model, models } = pkg;

export default class DatabaseClient {
  constructor(client, uri, options = {}) {
    this.client = client;
    this.uri = uri;
    this.options = {
      ...options,
    };
    this.models = {};
  }

  async connect() {
    try {
      await connect(this.uri, this.options);
      this.client.logger.success("✅ Connected to MongoDB");
    } catch (error) {
      this.client.logger.error("❌ Failed to connect to MongoDB:", error.message);
      process.exit(1);
    }
  }

  defineModel(collectionName, schemaDefinition) {
    try {
      if (!collectionName || !schemaDefinition) {
        throw new Error("Collection name and schema definition are required.");
      }

      if (models[collectionName]) {
        this.client.logger.warn(`⚠️ Model for '${collectionName}' already exists. Reusing the existing model.`);
        this.models[collectionName] = models[collectionName];
      } else {
        const schema = new Schema(schemaDefinition, { timestamps: true });
        this.models[collectionName] = model(collectionName, schema);
        this.client.logger.success(`✅ Model for '${collectionName}' defined successfully.`);
      }

      return this.models[collectionName];
    } catch (error) {
      this.client.logger.error(`❌ Failed to define model for '${collectionName}':`, error.message);
      throw error;
    }
  }

  getModel(collectionName) {
    const model = this.models[collectionName];
    if (!model) {
      throw new Error(`Model for '${collectionName}' has not been defined.`);
    }
    return model;
  }

  // CRUD Operations

  async get(collectionName, query) {
    try {
      const collection = this.getModel(collectionName);
      const data = await collection.findOne(query).exec();
      return data || null;
    } catch (error) {
      this.client.logger.error(`❌ Failed to fetch from '${collectionName}':`, error.message);
      throw error;
    }
  }

  async getAll(collectionName, query = {}, options = {}) {
    try {
      const collection = this.getModel(collectionName);
      const data = await collection.find(query, null, options).exec();
      return data;
    } catch (error) {
      this.client.logger.error(`❌ Failed to fetch from '${collectionName}':`, error.message);
      throw error;
    }
  }

  async insert(collectionName, doc) {
    try {
      const collection = this.getModel(collectionName);
      const newDoc = new collection(doc);
      await newDoc.save();
      this.client.logger.success(`✅ Successfully inserted into '${collectionName}'`);
      return newDoc;
    } catch (error) {
      this.client.logger.error(`❌ Failed to insert into '${collectionName}':`, error.message);
      throw error;
    }
  }

  async update(collectionName, query, updateData, options = { new: true }) {
    try {
      const collection = this.getModel(collectionName);
      const updatedDoc = await collection.findOneAndUpdate(query, updateData, options).exec();
      if (!updatedDoc) {
        this.client.logger.warn(`⚠️ No document found to update in '${collectionName}'`);
      } else {
        this.client.logger.success(`✅ Successfully updated document in '${collectionName}'`);
      }
      return updatedDoc;
    } catch (error) {
      this.client.logger.error(`❌ Failed to update in '${collectionName}':`, error.message);
      throw error;
    }
  }

  async delete(collectionName, query) {
    try {
      const collection = this.getModel(collectionName);
      const deletedDoc = await collection.findOneAndDelete(query).exec();
      if (!deletedDoc) {
        this.client.logger.warn(`⚠️ No document found to delete in '${collectionName}'`);
      } else {
        this.client.logger.success(`✅ Successfully deleted document from '${collectionName}'`);
      }
      return deletedDoc;
    } catch (error) {
      this.client.logger.error(`❌ Failed to delete from '${collectionName}':`, error.message);
      throw error;
    }
  }
}
