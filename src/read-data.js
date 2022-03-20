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

    let params = {
        TableName: tableName,
        KeyConditionExpression: "schoolId = :schoolId",
        ExpressionAttributeValues: {":schoolId": event.schoolId}
    }, results = [], entry = null

    do {
        entries = await dynamodb.query(params).promise()
        // collect the results and advance the cursor
        results.push(...entries.Items)
        params.ExclusiveStartKey = entries.lastEvaluatedKey
    } while(entries.lastEvaluatedKey);
    return results
// TODO (extra credit) if event.studentLastName exists then query using the 'studentLastNameGsi' GSI and return the results.

  // TODO (extra credit) limit the amount of records returned in the query to 5 and then implement the logic to return all
    //  pages of records found by the query (uncomment the test which exercises this functionality)
};
