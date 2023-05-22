import chProcess from "child_process";


async function writeLog(data) {
    console.log(data);
}

const jobShellExecutor = (
      command,
      cmdPath,
      regex,
) => {
      return new Promise((resolve, reject) => {
                const result = [];
                const resSpawn = chProcess.spawn(command, [], {
                              cwd: cmdPath,
                              shell: "/bin/bash",
                          });
                resSpawn.on("error", (error) => reject(error));
                resSpawn.stderr.on("data", (data) => {
                              writeLog(data.toString());
                          });
                resSpawn.stdout.on("data", (data) => {
                              if (regex && data.toString().match(regex)) {
                                                result.push(data.toString().match(regex)[0]);
                                            }
                          });
                resSpawn.on("close", (code) => {
                              writeLog(`child process exited with code ${code}`);
                              if (code === 1) {
                                                throw new Error(`error executing command ${command}`);
                                            }
                              writeLog(`child process exited with code ${code}\n`);
                              return resolve(result);
                          });
            });
};


export { jobShellExecutor };
