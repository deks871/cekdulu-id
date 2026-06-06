import fs from 'fs';
import path from 'path';
import { analyzeScam } from '../src/lib/scamAnalyzer';

// Load environment variables if running standalone
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function runBenchmark() {
  const datasetDir = path.join(process.cwd(), 'test-dataset');
  const safeDir = path.join(datasetDir, 'safe');
  const scamDir = path.join(datasetDir, 'scam');

  console.log('🚀 Starting Scam Detection Engine Benchmark...\n');

  let truePositives = 0; // Correctly identified scams
  let trueNegatives = 0; // Correctly identified safe
  let falsePositives = 0; // Safe flagged as scam
  let falseNegatives = 0; // Scam flagged as safe

  const threshold = 50; // Score >= 50 is considered a Scam/Warning for this benchmark

  // Helper to read and process a directory
  async function processDirectory(dir: string, expectedIsScam: boolean) {
    if (!fs.existsSync(dir)) {
      console.warn(`⚠️ Directory not found: ${dir}`);
      return;
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));
    if (files.length === 0) {
      console.warn(`⚠️ No .txt files found in ${dir}`);
      return;
    }

    for (const file of files) {
      const text = fs.readFileSync(path.join(dir, file), 'utf-8');
      const result = await analyzeScam(text);
      const isFlagged = result.score >= threshold;

      if (expectedIsScam) {
        if (isFlagged) truePositives++;
        else falseNegatives++;
      } else {
        if (!isFlagged) trueNegatives++;
        else falsePositives++;
      }
      
      // Delay to avoid hitting rate limits on Gemini API during benchmark
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log('Processing Safe Dataset...');
  await processDirectory(safeDir, false);
  
  console.log('Processing Scam Dataset...');
  await processDirectory(scamDir, true);

  const total = truePositives + trueNegatives + falsePositives + falseNegatives;
  
  if (total === 0) {
    console.log('❌ No benchmark data processed. Please add .txt files to test-dataset/safe and test-dataset/scam.');
    return;
  }

  const accuracy = (truePositives + trueNegatives) / total;
  const precision = truePositives / (truePositives + falsePositives || 1);
  const recall = truePositives / (truePositives + falseNegatives || 1);
  const fpr = falsePositives / (falsePositives + trueNegatives || 1);
  const fnr = falseNegatives / (falseNegatives + truePositives || 1);

  console.log('\n📊 Benchmark Results:');
  console.log('---------------------------');
  console.log(`Total Samples: ${total}`);
  console.log(`True Positives (Scam -> Scam): ${truePositives}`);
  console.log(`True Negatives (Safe -> Safe): ${trueNegatives}`);
  console.log(`False Positives (Safe -> Scam): ${falsePositives}`);
  console.log(`False Negatives (Scam -> Safe): ${falseNegatives}`);
  console.log('---------------------------');
  console.log(`Accuracy  : ${(accuracy * 100).toFixed(2)}%`);
  console.log(`Precision : ${(precision * 100).toFixed(2)}%`);
  console.log(`Recall    : ${(recall * 100).toFixed(2)}%`);
  console.log(`FPR       : ${(fpr * 100).toFixed(2)}%`);
  console.log(`FNR       : ${(fnr * 100).toFixed(2)}%`);
  console.log('---------------------------\n');
}

runBenchmark().catch(console.error);
