// src/services/seedDatabase.js
import { collection, writeBatch, getDocs, doc } from 'firebase/firestore';
import { db } from './firebase.js';
// Import the config to get access to the API key
import { firebaseConfig } from '../config/firebaseConfig.js';

const exercisesCSV = `id,name,bodyPart,metricType,defaultUnit
ex001,Treadmill Run,Cardio,time_distance,km
ex002,Stationary Cycle,Legs,time_distance,km
ex003,Rowing Machine,Full Body,time_distance,m
ex004,Stair Climber,Legs,time_distance,floors
ex005,Elliptical Trainer,Full Body,time_distance,km
ex006,Barbell Bench Press,Chest,weight_reps,kg
ex007,Dumbbell Bench Press,Chest,weight_reps,kg
ex008,Incline Dumbbell Press,Chest,weight_reps,kg
ex009,Chest Fly Machine,Chest,weight_reps,kg
ex010,Push-up,Chest,bodyweight,reps
ex011,Pull-up,Back,bodyweight,reps
ex012,Lat Pulldown Machine,Back,weight_reps,kg
ex013,Bent-Over Barbell Row,Back,weight_reps,kg
ex014,Seated Cable Row,Back,weight_reps,kg
ex015,Dumbbell Single Arm Row,Back,weight_reps,kg
ex016,Barbell Squat,Legs,weight_reps,kg
ex017,Leg Press Machine,Legs,weight_reps,kg
ex018,Lunge,Legs,bodyweight,reps
ex019,Leg Extension Machine,Legs,weight_reps,kg
ex020,Hamstring Curl Machine,Legs,weight_reps,kg
ex021,Standing Calf Raise,Legs,weight_reps,kg
ex022,Overhead Press (Barbell),Shoulders,weight_reps,kg
ex023,Seated Dumbbell Press,Shoulders,weight_reps,kg
ex024,Lateral Raise (Dumbbell),Shoulders,weight_reps,kg
ex025,Front Raise (Dumbbell),Shoulders,weight_reps,kg
ex026,Bicep Curl (Barbell),Arms,weight_reps,kg
ex027,Bicep Curl (Dumbbell),Arms,weight_reps,kg
ex028,Hammer Curl (Dumbbell),Arms,weight_reps,kg
ex029,Tricep Pushdown (Cable),Arms,weight_reps,kg
ex030,Tricep Dip,Arms,bodyweight,reps
ex031,Plank,Core,time,seconds
ex032,Crunch,Core,bodyweight,reps
ex033,Leg Raise,Core,bodyweight,reps
ex034,Russian Twist,Core,bodyweight,reps
ex035,Deadlift (Barbell),Full Body,weight_reps,kg
ex036,Kettlebell Swing,Full Body,weight_reps,kg
ex037,Burpee,Full Body,bodyweight,reps
ex038,Jumping Jack,Cardio,bodyweight,reps
ex039,Mountain Climber,Core,bodyweight,reps
ex040,High Knees,Cardio,bodyweight,reps
ex041,Box Jump,Legs,bodyweight,reps
ex042,Battle Ropes,Full Body,time,seconds
ex043,Sled Push,Full Body,weight_reps,kg
ex044,Farmer's Walk,Full Body,weight_reps,kg
ex045,Tire Flip,Full Body,weight_reps,kg
ex046,Wall Ball,Full Body,weight_reps,kg
ex047,Clean and Jerk,Full Body,weight_reps,kg
ex048,Snatch,Full Body,weight_reps,kg
ex049,Thruster,Full Body,weight_reps,kg
ex050,Good Morning,Back,weight_reps,kg
ex051,Hyperextension,Back,bodyweight,reps
ex052,Face Pull,Shoulders,weight_reps,kg
ex053,Shrug (Barbell),Shoulders,weight_reps,kg
ex054,Upright Row (Barbell),Shoulders,weight_reps,kg
ex055,Arnold Press,Shoulders,weight_reps,kg
ex056,Reverse Fly Machine,Shoulders,weight_reps,kg
ex057,Pec Deck Machine,Chest,weight_reps,kg
ex058,Cable Crossover,Chest,weight_reps,kg
ex059,Decline Bench Press,Chest,weight_reps,kg
ex060,T-Bar Row,Back,weight_reps,kg
ex061,Chin-up,Back,bodyweight,reps
ex062,Romanian Deadlift,Legs,weight_reps,kg
ex063,Goblet Squat,Legs,weight_reps,kg
ex064,Bulgarian Split Squat,Legs,weight_reps,kg
ex065,Seated Calf Raise,Legs,weight_reps,kg
ex066,Hip Thrust,Legs,weight_reps,kg
ex067,Preacher Curl,Arms,weight_reps,kg
ex068,Concentration Curl,Arms,weight_reps,kg
ex069,Skull Crusher,Arms,weight_reps,kg
ex070,Overhead Tricep Extension,Arms,weight_reps,kg
ex071,Wrist Curl,Arms,weight_reps,kg
ex072,Reverse Wrist Curl,Arms,weight_reps,kg
ex073,Hanging Knee Raise,Core,bodyweight,reps
ex074,Ab Rollout,Core,bodyweight,reps
ex075,Cable Woodchopper,Core,weight_reps,kg
ex076,Side Plank,Core,time,seconds
ex077,Cycling (Outdoor),Cardio,time_distance,km
ex078,Swimming,Cardio,time_distance,m
ex079,Running (Outdoor),Cardio,time_distance,km
ex080,Walking,Cardio,time_distance,km
ex081,Yoga,Flexibility,time,minutes
ex082,Stretching,Flexibility,time,minutes
ex083,Foam Rolling,Flexibility,time,minutes
ex084,Pilates,Flexibility,time,minutes
ex085,Zumba,Cardio,time,minutes
ex086,HIIT,Cardio,time,minutes
ex087,CrossFit,Full Body,time,minutes
ex088,Powerlifting,Strength,weight_reps,kg
ex089,Bodybuilding,Strength,weight_reps,kg
ex090,Calisthenics,Strength,bodyweight,reps
ex091,Incline Bench Press (Barbell),Chest,weight_reps,kg
ex092,Decline Dumbbell Press,Chest,weight_reps,kg
ex093,Dumbbell Fly,Chest,weight_reps,kg
ex094,Inverted Row,Back,bodyweight,reps
ex095,Rack Pull,Back,weight_reps,kg
ex096,Front Squat (Barbell),Legs,weight_reps,kg
ex097,Hack Squat Machine,Legs,weight_reps,kg
ex098,Walking Lunge,Legs,bodyweight,reps
ex099,Glute Bridge,Legs,bodyweight,reps
ex100,Military Press (Seated),Shoulders,weight_reps,kg
ex101,Dumbbell Row (Chest Supported),Back,weight_reps,kg
ex102,Cable Pull-Through,Legs,weight_reps,kg
ex103,Sumo Deadlift,Legs,weight_reps,kg
ex104,Close-Grip Bench Press,Arms,weight_reps,kg
ex105,Spider Curl,Arms,weight_reps,kg
ex106,Tricep Kickback,Arms,weight_reps,kg
ex107,Diamond Push-up,Arms,bodyweight,reps
ex108,V-Up,Core,bodyweight,reps
ex109,Bicycle Crunch,Core,bodyweight,reps
ex110,Flutter Kick,Core,bodyweight,reps
ex111,Hollow Hold,Core,time,seconds
ex112,Kettlebell Goblet Squat,Legs,weight_reps,kg
ex113,Kettlebell Deadlift,Full Body,weight_reps,kg
ex114,Kettlebell Press,Shoulders,weight_reps,kg
ex115,Kettlebell Row,Back,weight_reps,kg
ex116,Turkish Get-Up,Full Body,weight_reps,kg
ex117,Medicine Ball Slam,Full Body,weight_reps,kg
ex118,Medicine Ball Twist,Core,weight_reps,kg
ex119,Box Squat,Legs,weight_reps,kg
ex120,Pause Squat,Legs,weight_reps,kg
ex121,Pause Bench Press,Chest,weight_reps,kg
ex122,Spoto Press,Chest,weight_reps,kg
ex123,Z Press,Shoulders,weight_reps,kg
ex124,Landmine Press,Shoulders,weight_reps,kg`;

const parseCSV = (csvString) => {
    const [header, ...rows] = csvString.trim().split('\n');
    const headers = header.split(',');
    return rows.map(row => {
        const values = row.split(',');
        return headers.reduce((obj, nextKey, index) => {
            obj[nextKey] = values[index];
            return obj;
        }, {});
    });
};

export const seedExerciseLibrary = async () => {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const libraryCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'exercise-library');
    
    const snapshot = await getDocs(libraryCollectionRef);
    if (!snapshot.empty) {
        console.log("Exercise library already contains data. Seeding skipped.");
        return;
    }

    console.log("Exercise library is empty. Seeding database with 124 exercises...");
    const exercises = parseCSV(exercisesCSV);
    const batch = writeBatch(db);

    for (const exercise of exercises) {
        const imageUrl = `https://placehold.co/600x400/1f2937/7dd3fc?text=${exercise.name.replace(/\s/g, '+')}`;
        const exerciseData = {
            id: exercise.id,
            name: exercise.name,
            bodyPart: exercise.bodyPart,
            metricType: exercise.metricType,
            defaultUnit: exercise.defaultUnit || '',
            description: '',
            imageUrl: imageUrl,
        };
        const docRef = doc(libraryCollectionRef, exercise.id);
        batch.set(docRef, exerciseData);
    }

    await batch.commit();
    console.log("SUCCESS: Exercise library has been seeded with placeholder data.");
    console.log("Next step: We will now enrich the data with AI-generated descriptions.");

    await enrichLibraryWithDescriptions();
};

const enrichLibraryWithDescriptions = async () => {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const libraryCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'exercise-library');
    const snapshot = await getDocs(libraryCollectionRef);
    const batch = writeBatch(db);

    console.log("Starting AI enrichment for exercise descriptions...");

    for (const docSnapshot of snapshot.docs) {
        const exercise = docSnapshot.data();
        if (!exercise.description) {
            const prompt = `Provide a concise, 2-3 sentence explanation for how to perform a ${exercise.name}. Focus on the key steps for proper form.`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            // FIX: Use the API key from our config file
            const apiKey = firebaseConfig.apiKey; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            try {
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) throw new Error(`API request failed for ${exercise.name}`);
                
                const result = await response.json();
                if (result.candidates && result.candidates.length > 0) {
                    const text = result.candidates[0].content.parts[0].text;
                    batch.update(docSnapshot.ref, { description: text });
                    console.log(`- Generated description for: ${exercise.name}`);
                }
            } catch (e) {
                console.error(`Could not fetch description for ${exercise.name}.`, e);
            }
        }
    }

    await batch.commit();
    console.log("SUCCESS: AI enrichment complete. All exercises should now have descriptions.");
};
