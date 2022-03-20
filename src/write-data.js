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

const schema = {
  schoolId: value => value && String(value),
  schoolName: value => value && String(value),
  studentId: value => value && String(value),
  studentFirstName: value => value && String(value),
  studentLastName: value => value && String(value),
  studentGrade: value => value && String(value)
}

function validate(entry) {
    return Object.keys(entry).length === 6
        && Object.keys(schema).every(key => schema[key](entry[key]))
        && Object.values(entry).every(value => typeof(value) === 'string' )
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
