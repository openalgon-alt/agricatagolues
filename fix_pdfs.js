import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tqssenyemstlqpionqyp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc3NlbnllbXN0bHFwaW9ucXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTk1NTUsImV4cCI6MjA4MzAzNTU1NX0.EYRRHALYoOSZb-w_zXch-mxvS66Upj00kCw_r-YdZf0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log("Fetching articles...");
  const { data: articles, error } = await supabase.from('articles').select('*');
  
  if (error) {
    console.error("Error fetching articles:", error);
    return;
  }
  
  console.log(`Found ${articles.length} articles.`);
  
  for (const article of articles) {
    if (!article.pdf_url) continue;
    
    // Check if it has spaces or special characters in the filename part
    const urlParts = article.pdf_url.split('/');
    const filename = urlParts.pop();
    
    // JS equivalent of preg_replace("/[^a-zA-Z0-9\._-]/", "", $filename)
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9\._-]/g, "");
    
    if (filename !== sanitizedFilename) {
      urlParts.push(sanitizedFilename);
      const newUrl = urlParts.join('/');
      
      console.log(`Updating article ${article.id}`);
      console.log(`  Old: ${article.pdf_url}`);
      console.log(`  New: ${newUrl}`);
      
      const { error: updateError } = await supabase
        .from('articles')
        .update({ pdf_url: newUrl })
        .eq('id', article.id);
        
      if (updateError) {
        console.error(`  Failed to update:`, updateError);
      } else {
        console.log(`  Successfully updated!`);
      }
    }
  }
  
  console.log("Done.");
}

main().catch(console.error);
