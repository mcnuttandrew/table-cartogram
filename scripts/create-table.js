const {getFile, writeFile} = require('hoopoe');
const {tsvParse} = require('d3-dsv');

const color = {
  Yes: '\\cellcolor{red!50}',
  Sometimes: '\\cellcolor{red!25}',
};
function shortRow(row) {
  return `${row.Task.trim()} & ${row.Alpha} ${color[row['Confuser Summary']] || ''}\\\\`;
}

function shortTableOutput(rows) {
  return `
\\midsepremove

\\begin{table}[t]
\\centering
\\topcaption{
The \\taco{}'s relationship with Amar \\etals \\cite{amar2005low} task list. We test these tasks  with a set of $\\alpha$s that sometimes create \\colorbox{red!25}{confusers under some conditions} as well as those that \\colorbox{red!50}{always create confusers}.
}
\\begin{tabular}{|l|p{1.8in}|}
\\toprule
Task & AVD $\\alpha$\\\\
\\toprule
${rows
  .filter((d) => d.USING.includes('Yes'))
  .map(shortRow)
  .join('\n')}
\\bottomrule
\\end{tabular}
\\label{tab:nusrat-table}
\\end{table}

\\midsepdefault
      `;
}

function longRow(row) {
  return `${row.Task.trim()} & ${row.Explanation} & ${row['Example cartogram task']}  & ${row.Alpha} & ${
    row.Confuser
  } \\\\`;
}

function longTableOutput(rows) {
  return `
\\midsepremove

\\begin{table*}[t]
\\centering
\\topcaption{
An extended version of \\tabref{tab:nusrat-table}, which related Amar \\etals \\cite{amar2005low} low level task taxonomy to a set of AVD $\\alpha$s meant to probe the pliability of the table cartogram to that task. 
}
\\small
\\begin{tabular}{|>{\\raggedright\\arraybackslash}p{.6in}|>{\\raggedright\\arraybackslash}p{1.5in}|>{\\raggedright\\arraybackslash}p{2in}|>{\\raggedright\\arraybackslash}p{.8in}|>{\\raggedright\\arraybackslash}p{1.2in}|}
\\toprule
Task & Task Description & Example Task & AVD $\\alpha$  & Confuser \\\\
\\toprule
${rows
  .filter((d) => d.USING.includes('Yes'))
  .map(longRow)
  .join('\n')}
\\bottomrule
\\end{tabular}
\\label{tab:long-table}
\\end{table*}

\\midsepdefault
      `;
}

getFile(`./scripts/task-analysis.tsv`)
  .then((d) => tsvParse(d))
  .then((d) => {
    writeFile('./scripts/task-table.tex', shortTableOutput(d));
    writeFile('./scripts/long-task-table.tex', longTableOutput(d));
  })
  .catch((e) => {
    console.log(e);
  });
