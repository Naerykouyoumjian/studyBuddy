import React, {useState} from 'react';

function StudentProfile() {
    //Declare state variables
    const [name, setName] = useState("Mary Kay");
    const [age, setAge] = useState(23);
    const [major, setMajor] = useState("ComputerScience");

    return (
        <div>
            <h1>StudentProfile</h1>
            <form>
                <div>
                    <label>Name: </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)} //Update name in input
                    />
                </div>
                <div>
                    <label>age: </label>
                    <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))} //Update age on input
                    />
                </div>
                <div>
                    <label>Major: </label>
                    <input
                        type="text"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)} //Update major on input
                    />
                </div>
            </form>
        </div>
    );
}

export default StudentProfile;