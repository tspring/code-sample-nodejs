const DynamoDB = require('aws-sdk/clients/dynamodb')

const dynamodb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  endpoint: 'http://localhost:8000',
  region: 'us-west-2',
  accessKeyId: "fakeMyKeyId",
  secretAccessKey: "fakeSecretAccessKey"
    // what could you do to improve performance?
    // optimize imports by per: https://docs.aws.amazon.com/lambda/latest/operatorguide/static-initialization.html
    // avoid dynamic function invocations in object construction per: https://iacoma.cs.uiuc.edu/iacoma-papers/pldi14.pdf
});

const tableName = 'SchoolStudents';

const schema = {
  schoolId: value => value && typeof(value) == 'string',
  schoolName: value => value && typeof(value) == 'string',
  studentId: value => value && typeof(value) == 'string',
  studentFirstName: value => value && typeof(value) == 'string',
  studentLastName: value => value && typeof(value) == 'string',
  studentGrade: value => value && typeof(value) == 'string'

}

function validate(entry) {
    return Object.keys(schema).every(key => schema[key](entry[key]))
}

/**
 * The entry point into the lambda
 *
 * @param {Object} event
 * @param {string} event.schoolId
 * @param {string} event.schoolName
 * @param {string} event.studentId
 * @param {string} event.studentFirstName
 * @param {string} event.studentLastName
 * @param {string} event.studentGrade
 */
exports.handler = async (event) => {
    // The 'SchoolStudents' table key is composed of schoolId (partition key) and studentId (range key).
    try {
        let student = {
            schoolId: event.schoolId,
            schoolName: event.schoolName,
            studentId: event.studentId,
            studentFirstName: event.studentFirstName,
            studentLastName: event.studentLastName,
            studentGrade: event.studentGrade
        };

        if (!validate(event)) {
            // TODO: handle invalid db entries
            console.log('Invalid schema')
        } else {
            await dynamodb.put({TableName: tableName, Item: student}, (err, data) => {
                if (err) console.log(`Error writing to dynamodb ${err}`)
            }).promise();
        }
    } catch (error) {
        //TODO:
        console.log(error)
    }
};
