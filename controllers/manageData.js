const codeQuiz = require('../models/codeQuiz')
const companyDetails = require('../models/companyDetails')
const companyHirings = require('../models/companyHirings')
const collegeData = require('../models/collegeData')
const mail = require('../models/mail')
const detailsVerification = require('../models/detailsVerification')
const facultyData = require('../models/facultyData')
const notifications = require('../models/notifications')
const placementDetails = require('../models/placementDetails')
const placementStatus = require('../models/placementStatus')
const studentData = require('../models/studentData')
const users = require('../models/users')


exports.getCodeQuiz = async (methodName, condition, fields) => {
    try {
        const response = await codeQuiz[methodName](condition).select(fields).lean();
        return response
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.getCompanyDetails = async (methodName, condition, fields) => {
    try {
        const response = await companyDetails[methodName](condition).select(fields).lean().sort("createdon");
        return response
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.getCompanyHirings = async (methodName, condition, fields) => {
    try {
        const response = await companyHirings[methodName](condition).select(fields).lean();
        return response
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.getCollegeData = async (methodName, condition, fields) => {
    try {
        const response = await collegeData[methodName](condition).select(fields).lean();
        return response
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.getMail = async (methodName, condition, fields) => {
    try {
        const response = await mail[methodName](condition).select(fields).lean();
        return response
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.getDetailsVerification = async (methodName, condition, fields) => {
    try {
        const response = await detailsVerification[methodName](condition).select(fields).lean();
        return response
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.getFacultyData = async (methodName, condition, fields) => {
    try {
        const response = await facultyData[methodName](condition).select(fields).lean();
        return response
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.getNotifications = async (methodName, condition, fields) => {
    try {
        const response = await notifications[methodName](condition).select(fields).lean();
        return response
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}




exports.getPlacementDetails = async (methodName, condition, fields) => {
    try {
        const response = await placementDetails[methodName](condition).select(fields).lean();
        return response
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.getPlacementStatus = async (methodName, condition, fields) => {
    try {
        const response = await placementStatus[methodName](condition).select(fields).lean();
        return response
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.getStudentData = async (methodName, condition, fields) => {
    try {
        const response = await studentData[methodName](condition).select(fields).sort({ 'rollnumber': 1 }).lean();
        return response
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.getUsers = async (methodName, condition, fields) => {
    try {
        const response = await users[methodName](condition).select(fields).lean();
        return response
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}




















//update data


exports.updateCodeQuiz = async (methodName, condition, updatedata) => {
    try {
        await codeQuiz[methodName](condition, { $set: updatedata });
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.updateCompanyDetails = async (methodName, condition, updatedata) => {
    try {
        // console.log("methodName,condition,updatedata ",methodName,condition,updatedata )
        let data = await companyDetails[methodName](condition, { $set: updatedata });
        // console.log(data,"data")
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.updateCompanyHirings = async (methodName, condition, updatedata) => {
    try {
        await companyHirings[methodName](condition, { $set: updatedata });
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.updateCollegeData = async (methodName, condition, updatedata) => {
    try {
        await collegeData[methodName](condition, { $set: updatedata });
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.updateMail = async (methodName, condition, updatedata) => {
    try {
        await mail[methodName](condition, { $set: updatedata });
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.updateDetailsVerification = async (methodName, condition, updatedata) => {
    try {
        await detailsVerification[methodName](condition, { $set: updatedata });
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.updateFacultyData = async (methodName, condition, updatedata) => {
    try {
        await facultyData[methodName](condition, { $set: updatedata });
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.updateNotifications = async (methodName, condition, updatedata) => {
    try {
        await notifications[methodName](condition, { $set: updatedata });
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}




exports.updatePlacementDetails = async (methodName, condition, updatedata) => {
    try {
        await placementDetails[methodName](condition, { $set: updatedata });
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.updatePlacementStatus = async (methodName, condition, updatedata) => {
    try {
        // console.log(methodName, condition, updatedata, "accepted")
        data = await placementStatus[methodName](condition, { $set: updatedata });
        // console.log(data, "data")
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.updateStudentData = async (methodName, condition, updatedata) => {
    try {
        await studentData[methodName](condition, { $set: updatedata });
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.updateUsers = async (methodName, condition, updatedata) => {
    try {
        await users[methodName](condition, { $set: updatedata });
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}
































//create dataaa

exports.postCodeQuiz = async (methodName, condition) => {
    try {
        await codeQuiz[methodName](condition);
        return response
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.postCompanyDetails = async (methodName, condition) => {
    try {
        await companyDetails[methodName](condition);
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.postCompanyHirings = async (methodName, condition) => {
    try {
        let co = condition
        delete co['lastItem'];
        // console.log(condition,"condition")
        let d = await companyHirings[methodName](co);
        // console.log(d, "data................in post companyhirings")
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.postCollegeData = async (methodName, condition) => {
    try {
        await collegeData[methodName](condition);
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.postMail = async (methodName, condition) => {
    try {
        await mail[methodName](condition);
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.postDetailsVerification = async (methodName, condition) => {
    try {
        await detailsVerification[methodName](condition);
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.postFacultyData = async (methodName, condition) => {
    try {
        await facultyData[methodName](condition);
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.postNotifications = async (methodName, condition) => {
    try {
        await notifications[methodName](condition);
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}



exports.postPlacementDetails = async (methodName, condition) => {
    try {
        await placementDetails[methodName](condition);
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.postPlacementStatus = async (methodName, condition) => {
    try {
        await placementStatus[methodName](condition);
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.postStudentData = async (methodName, condition) => {
    try {
        await studentData[methodName](condition);
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}

exports.postUsers = async (methodName, condition) => {
    try {
        await users[methodName](condition);
        return { message: "success" }
    }
    catch (err) {
        return { message: 'error', err: err }
    }
}























