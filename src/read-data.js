const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  endpoint: new AWS.Endpoint('http://localhost:8000'),
  region: 'us-west-2',
  accessKeyId: "fakeMyKeyId",
  secretAccessKey: "fakeSecretAccessKey"
  // what could you do to improve performance?
});

const tableName = 'SchoolStudents';
const studentLastNameGsiName = 'studentLastNameGsi';

/**
 * The entry point into the lambda
 *
 * @param {Object} event
 * @param {string} event.schoolId
 * @param {string} event.studentId
 * @param {string} [event.studentLastName]
 */
exports.handler = async (event) => {
  // The 'SchoolStudents' table key is composed of schoolId (partition key) and studentId (range key).
  try {
    let params = {TableName: tableName, Limit: 5}, results = []

    if (event.studentLastName) {
      params.IndexName = "studentLastNameGsi"
      params.KeyConditionExpression = "studentLastName = :studentLastName"
      params.ExpressionAttributeValues = { ":studentLastName": event.studentLastName }
    } else {
      params.KeyConditionExpression = "schoolId = :schoolId",
      params.ExpressionAttributeValues = {":schoolId": event.schoolId}
      if (event.studentId) {
          params.KeyConditionExpression =  "schoolId = :schoolId and studentId = :studentId"
          params.ExpressionAttributeValues[":studentId"] =  event.studentId
        }
    }

    do {
      entries = await dynamodb.query(params).promise()
      // collect the results and advance the cursor
      results.push(...entries.Items)
      params.ExclusiveStartKey = entries.LastEvaluatedKey
    } while(entries.LastEvaluatedKey);

    return results
  } catch (error) {
      console.log(error)
  }
};
