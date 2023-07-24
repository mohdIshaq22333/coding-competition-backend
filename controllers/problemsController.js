const asyncHandler = require("express-async-handler");
const Sandbox = require("sandbox");

const fs = require("fs");
let problems = {};

fs.readFile("./data/problemsData.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading JSON file:", err);
    process.exit(1);
  }

  try {
    problems = JSON.parse(data);
  } catch (parseErr) {
    console.error("Error parsing JSON data:", parseErr);
    process.exit(1);
  }
});

const getProblem = asyncHandler(async (req, res) => {
  try {
    const problem = {
      ...problems?.data?.find((val) => val?.id == req?.params?.id),
    };
    if (!problem?.title) {
      return res.status(404).json({ error: "Question not found" });
    }
    delete problem.test_cases;
    return res.status(200).json({ ...problem });
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
const testProblem = asyncHandler(async (req, res) => {
  try {
    const problem = problems?.data?.find((val) => val?.id == req?.params?.id);
    if (!problem) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (!req?.body?.code?.includes("function main(")) {
      return res
        .status(400)
        .json({ error: "Code must include a 'main' function." });
    }

    var s = new Sandbox();
    let casesResult = [];
    const allCases = problem?.test_cases?.map((val, index) => async () => {
      try {
        let triggerFunc = `(()=>main(${val?.input}))()`;
        let timeoutId;
        const passed = await new Promise((resolve, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error("Code execution exceeded the maximum time."));
          }, 5000);
          s.run(`${req?.body?.code}\n${triggerFunc}`, (output) => {
            clearTimeout(timeoutId);
            resolve(output);
          });
        });
        casesResult.push({
          case: `Case ${index}`,
          passed:
            passed?.result?.replace(/'/g, "") ==
            val?.expected_output?.replace(/"/g, ""),
        });
      } catch (error) {
        casesResult.push({
          case: `Case ${index}`,
          passed: false,
          error: error.message,
        });
      }
    });
    await Promise.all(allCases?.map((fn) => fn()));
    return res.status(200).json({ mesg: "success", casesResult });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = {
  getProblem,
  testProblem,
};
