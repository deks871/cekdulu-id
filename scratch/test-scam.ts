import { analyzeScam } from "../src/lib/scamAnalyzer";

const text = "halo maaf mengganggu waktunya, saya dari kepolisian, keluarga anda sedang sakit di luar negeri. mohon konfirmasi dan minta data diri bapak.";

console.log("Input Text:", text);
const result = analyzeScam(text);
console.log(JSON.stringify(result, null, 2));
