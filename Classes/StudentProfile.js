class StudentProfile {
    constructor(studentName, studentEmail, studentPassword, profilePicture) {
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.studentPassword = studentPassword;
        this.profilePicture = profilePicture;
    }

    // Method to access study history
    accessStudyHistory() {
        //temporary: need to integrate later with studyHistoryManager
        console.log(`Accessing study history for ${this.studentName}`);
    }

    //Method to update student profile information
    updateProfile(newName, newEmail, newProfilePicture) {
        this.studentName = newName || this.studentName;
        this.studentEmail = newEmail || this.studentEmail;
        this.profilePicture = newProfilePicture || this.profilePicture;
        console.log('Profile updated');
    }
}

module.exports = StudentProfile;