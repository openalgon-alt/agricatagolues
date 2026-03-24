const fs = require('fs');
const file = 'src/components/exam/ExamDashboard.tsx';
let c = fs.readFileSync(file, 'utf8');

const searchStr = '{/* Paid Tests / Bundle */}';
const idx = c.indexOf(searchStr);
if (idx === -1) { console.error('Search string not found!'); process.exit(1); }

// Find the start of that line (go back to previous \n)
let lineStart = idx;
while (lineStart > 0 && c[lineStart - 1] !== '\n') lineStart--;
const indent = c.slice(lineStart, idx);

const insertBlock = `{/* Static Mock Test 1 \u2014 always visible beside the bundle card */}\r\n${indent}{!freeTests.some((t) => t.title === 'Mock Test 1') && (\r\n${indent}    <Card\r\n${indent}        className="border border-green-200 shadow-sm hover:shadow-md transition-all group bg-white cursor-pointer"\r\n${indent}        onClick={() => onSelectTest({ id: 1, title: 'Mock Test 1', description: 'Free introductory mock test covering agricultural specimen identification.', category: 'Agriculture', price: 0 })}\r\n${indent}    >\r\n${indent}        <div className="h-2 bg-green-500 w-full"></div>\r\n${indent}        <CardContent className="p-5">\r\n${indent}            <div className="flex justify-between items-start mb-3">\r\n${indent}                <div className="bg-green-100 p-2 rounded-lg text-green-700">\r\n${indent}                    <BookOpen className="w-5 h-5" />\r\n${indent}                </div>\r\n${indent}                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Free</span>\r\n${indent}            </div>\r\n${indent}            <h3 className="font-bold text-gray-900 text-lg mb-1">Mock Test 1</h3>\r\n${indent}            <p className="text-gray-500 text-xs mb-4">Free introductory mock test covering agricultural specimen identification.</p>\r\n${indent}            <div className="flex items-center gap-3 text-xs text-gray-500">\r\n${indent}                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 200 Marks</span>\r\n${indent}                <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" /> 50 Qs</span>\r\n${indent}            </div>\r\n${indent}        </CardContent>\r\n${indent}        <CardFooter className="p-4 pt-0">\r\n${indent}            <ResumeButton userId={userId} test={{ id: 1, title: 'Mock Test 1', description: '', category: 'Agriculture', price: 0 }} onSelectTest={onSelectTest} />\r\n${indent}        </CardFooter>\r\n${indent}    </Card>\r\n${indent})}\r\n\r\n${indent}`;

// Insert the block before the "Paid Tests / Bundle" comment
c = c.slice(0, lineStart) + insertBlock + c.slice(lineStart);

fs.writeFileSync(file, c, 'utf8');
console.log('Done! Inserted Mock Test 1 card.');
