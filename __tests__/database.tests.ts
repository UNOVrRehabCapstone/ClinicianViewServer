import {retrievePatientBalloonProgress, updatePatientBalloonProgress} from "../database/database";
import {afterAll, beforeAll, expect, jest, test} from "@jest/globals"
import dotenv from 'dotenv';
import mongoose from "mongoose";

async function connect1() {
  const uri = process.env.DBURI;
  if (uri) {
    mongoose.connect(uri);
  }
  else {
    console.log("Problem connecting to database. Environment variable not found.")
  }
}
function disconnectFromDb(){
  mongoose.connection.close();
}
beforeAll( () =>{
  dotenv.config();
  connect1();
})

  
test('retrievePatientBalloonProgress', async () => {

  let  testUserName: string ='edward';
  let testAchievementProgress = "1111111111";
  let testCareerProgress = "0";
  let testLevelOneScore: string = "3";
  let testLevelTwoScore: string = "3";
  let testLevelThreeScore: string = "0";
  let testLevelFourScore: string = "0";
  let testAch0: boolean = true;
  let testAch1: boolean = true;
  let testAch2: boolean = true;
  let testAch3: boolean = true;
  let testAch4: boolean = true;
  let testAch5: boolean = true;
  let testAch6: boolean = true;
  let testAch7: boolean = true;
  let testAch8: boolean = true;
  let testAch9: boolean = true;
 
  let testBalloonProgress ={
   testUserName,
   testAchievementProgress,
   testCareerProgress,
   testLevelOneScore,
   testLevelTwoScore,
   testLevelThreeScore,
   testLevelFourScore,
   testAch0,
   testAch1,
   testAch2,
   testAch3,
   testAch4,
   testAch5,
   testAch6,
   testAch7,
   testAch8,
   testAch9
  }

  let returnedData = await retrievePatientBalloonProgress(testUserName);
  expect(returnedData?.ach0).toBe(testBalloonProgress.testAch0);
  expect(returnedData?.levelOneScore).toBe(testBalloonProgress.testLevelOneScore);


});


test('updatePatientBalloonProgress', async () => {
  let testUser = "edward" ;
  let progress = await retrievePatientBalloonProgress(testUser);
  // get user data, change it, check if it's correct, then change it back
  if(progress){
    await updatePatientBalloonProgress(testUser,
      progress.levelOneScore,
      progress.levelTwoScore,
      progress.levelThreeScore,
      progress.levelFourScore,
      progress.levelFiveScore,
      progress.ach0,
      progress.ach1,
      progress.ach2,
      progress.ach3,
      progress.ach4,
      progress.ach5,
      progress.ach6,
      progress.ach7,
      progress.ach8,
      progress.ach9,
    );
    let progress2 = await retrievePatientBalloonProgress(testUser);
    if(progress2){
      await updatePatientBalloonProgress(testUser,

        progress2.levelOneScore,
        progress2.levelTwoScore,
        progress2.levelThreeScore,
        progress2.levelFourScore,
        progress2.levelFiveScore,
        progress2.ach0,
        progress2.ach1,
        progress2.ach2,
        progress2.ach3,
        progress2.ach4,
        progress2.ach5,
        progress2.ach6,
        progress2.ach7,
        progress2.ach8,
        progress2.ach9,
      );
    }


    // attempt to bad info
    if(progress2){
      progress2.levelFiveScore = "100";
      let retVal = await updatePatientBalloonProgress(testUser,
        progress2.levelOneScore,
        progress2.levelTwoScore,
        progress2.levelThreeScore,
        progress2.levelFourScore,
        progress2.levelFiveScore,
        progress2.ach0,
        progress2.ach1,
        progress2.ach2,
        progress2.ach3,
        progress2.ach4,
        progress2.ach5,
        progress2.ach6,
        progress2.ach7,
        progress2.ach8,
        progress2.ach9,
      );
      expect(retVal).toBeNull();
    }
    
  }

});


afterAll(() =>{
  disconnectFromDb();
})



