const OpenAI = require('openai-api');
require('dotenv').config();

// Initialize OpenAI with the API key
const openai = new OpenAI(process.env.OPENAI_API_KEY);

class StudyPlanGenerator {
    /**
     * constructor to initialize the StudyPlanGenerator class
     * @param {string} studentInput - student Information
     * @param {number} availableHours - student's available hours to study
     * @param {string} deadlines - The deadline for the study tasks
     * @param {Array} subjectPriority - Array of subjects with their priorities 
     */
    constructor(studentInput, availableHours, deadlines, subjectPriority) {
        this.studentInput = studentInput;
        this.availableHours = availableHours;
        this.deadlines = deadlines;
        this.subjectPriority = subjectPriority;
        this.generatedPlan = []; //store the generated study plan in an Array
    }

    /**
     * Method that generates a study plan using openAI
     * Sends a prompt to OpenAI and returns the generated plan
     * @returns {Object} - Object containing the generated study plan and a message
     */
    async generatePlan() {
        try {
            // Create a prompt for OpenAI with the necessary student details
            const prompt = `Create a study plan for a student with the following details:
                - Available hours per week: ${this.availableHours}
                - Deadlines: ${this.deadlines}
                - Priorities: ${JSON.stringify(this.subjectPriority)}`;

            // Send the prompt to OpenAI using the older API method
            const response = await openai.complete({
                engine: 'davinci',
                prompt: prompt,
                maxTokens: 150,
                temperature: 0.7
            });

            // Get the AI-generated study plan
            const aiGeneratedPlan = response.data.choices[0].text.trim();
            this.generatedPlan = aiGeneratedPlan;

            // Print the generated plan
            console.log('Your study plan: ', aiGeneratedPlan);

            // Return confirmation message
            return {
                message: 'The study plan has been generated successfully',
                plan: aiGeneratedPlan
            };
        } catch (error) {
            console.log('Error generating the study plan', error.message);

            // Return error message
            return {
                message: 'Failed to generate the plan',
                error: error.message
            };
        }
    }

    // Method to edit an existing study plan
    editPlan(newPlan) {
        this.generatedPlan = { ...this.generatedPlan, ...newPlan };
        console.log('The study plan has been edited:', this.generatedPlan);
    }

    // Method to update the available study hours
    updateHours(newHours) {
        this.availableHours = newHours;
        console.log('The updated available hours: ', newHours);
    }

    // Method to update the deadlines
    updateDeadlines(newDeadlines) {
        this.deadlines = newDeadlines;
        console.log('The updated deadlines: ', this.deadlines);
    }

    // Method to prioritize subjects
    prioritizeSubject(subject, priority) {
        const selectedSubject = this.subjectPriority.find(item => item.subject === subject);
        if (selectedSubject) {
            selectedSubject.priority = priority;
            console.log(`${subject} priority is updated to: ${priority}`);
        } else {
            console.log(`${subject} not found.`);
        }
    }

    // Method to save the generated study plan
    saveStudyPlan() {
        console.log('Study Plan has been saved: ', this.generatedPlan);
    }
}

module.exports = StudyPlanGenerator;
