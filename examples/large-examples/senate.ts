import {transposeMatrix} from '../../src/utils';

const senators = [
  {state: 'Alabama', party: 'Republican', name: 'Richard Shelby', date: 'January 3, 1987'},
  {state: 'Alabama', party: 'Democrat', name: 'Doug Jones', date: 'January 3, 2018'},
  {state: 'Alaska', party: 'Republican', name: 'Lisa Murkowski', date: 'December 20, 2002'},
  {state: 'Alaska', party: 'Republican', name: 'Dan Sullivan', date: 'January 3, 2015'},
  {state: 'Arizona', party: 'Republican', name: 'Jeff Flake', date: 'January 3, 2013'},
  {state: 'Arizona', party: 'Republican', name: 'Jon Kyl', date: 'September 5, 2018'},
  {state: 'Arkansas', party: 'Republican', name: 'John Boozman', date: 'January 3, 2011'},
  {state: 'Arkansas', party: 'Republican', name: 'Tom Cotton', date: 'January 3, 2015'},
  {state: 'California', party: 'Democrat', name: 'Dianne Feinstein', date: 'November 10, 1992'},
  {state: 'California', party: 'Democrat', name: 'Kamala Harris', date: 'January 3, 2017'},
  {state: 'Colorado', party: 'Democrat', name: 'Michael Bennet', date: 'January 22, 2009'},
  {state: 'Colorado', party: 'Republican', name: 'Cory Gardner', date: 'January 3, 2015'},
  {state: 'Connecticut', party: 'Democrat', name: 'Richard Blumenthal', date: 'January 3, 2011'},
  {state: 'Connecticut', party: 'Democrat', name: 'Chris Murphy', date: 'January 3, 2013'},
  {state: 'Delaware', party: 'Democrat', name: 'Tom Carper', date: 'January 3, 2001'},
  {state: 'Delaware', party: 'Democrat', name: 'Chris Coons', date: 'November 15, 2010'},
  {state: 'Florida', party: 'Democrat', name: 'Bill Nelson', date: 'January 3, 2001'},
  {state: 'Florida', party: 'Republican', name: 'Marco Rubio', date: 'January 3, 2011'},
  {state: 'Georgia', party: 'Republican', name: 'Johnny Isakson', date: 'January 3, 2005'},
  {state: 'Georgia', party: 'Republican', name: 'David Perdue', date: 'January 3, 2015'},
  {state: 'Hawaii', party: 'Democrat', name: 'Brian Schatz', date: 'December 26, 2012'},
  {state: 'Hawaii', party: 'Democrat', name: 'Mazie Hirono', date: 'January 3, 2013'},
  {state: 'Idaho', party: 'Republican', name: 'Mike Crapo', date: 'January 3, 1999'},
  {state: 'Idaho', party: 'Republican', name: 'Jim Risch', date: 'January 3, 2009'},
  {state: 'Illinois', party: 'Democrat', name: 'Dick Durbin', date: 'January 3, 1997'},
  {state: 'Illinois', party: 'Democrat', name: 'Tammy Duckworth', date: 'January 3, 2017'},
  {state: 'Indiana', party: 'Democrat', name: 'Joe Donnelly', date: 'January 3, 2013'},
  {state: 'Indiana', party: 'Republican', name: 'Todd Young', date: 'January 3, 2017'},
  {state: 'Iowa', party: 'Republican', name: 'Chuck Grassley', date: 'January 3, 1981'},
  {state: 'Iowa', party: 'Republican', name: 'Joni Ernst', date: 'January 3, 2015'},
  {state: 'Kansas', party: 'Republican', name: 'Pat Roberts', date: 'January 3, 1997'},
  {state: 'Kansas', party: 'Republican', name: 'Jerry Moran', date: 'January 3, 2011'},
  {state: 'Kentucky', party: 'Republican', name: 'Mitch McConnell', date: 'January 3, 1985'},
  {state: 'Kentucky', party: 'Republican', name: 'Rand Paul', date: 'January 3, 2011'},
  {state: 'Louisiana', party: 'Republican', name: 'Bill Cassidy', date: 'January 3, 2015'},
  {state: 'Louisiana', party: 'Republican', name: 'John Kennedy', date: 'January 3, 2017'},
  {state: 'Maine', party: 'Republican', name: 'Susan Collins', date: 'January 3, 1997'},
  {state: 'Maine', party: 'Independent', name: 'Angus King', date: 'January 3, 2013'},
  {state: 'Maryland', party: 'Democrat', name: 'Ben Cardin', date: 'January 3, 2007'},
  {state: 'Maryland', party: 'Democrat', name: 'Chris Van Hollen', date: 'January 3, 2017'},
  {state: 'Massachusetts', party: 'Democrat', name: 'Elizabeth Warren', date: 'January 3, 2013'},
  {state: 'Massachusetts', party: 'Democrat', name: 'Ed Markey', date: 'July 16, 2013'},
  {state: 'Michigan', party: 'Democrat', name: 'Debbie Stabenow', date: 'January 3, 2001'},
  {state: 'Michigan', party: 'Democrat', name: 'Gary Peters', date: 'January 3, 2015'},
  {state: 'Minnesota', party: 'Democrat', name: 'Amy Klobuchar', date: 'January 3, 2007'},
  {state: 'Minnesota', party: 'Democrat', name: 'Tina Smith', date: 'January 3, 2018'},
  {state: 'Mississippi', party: 'Republican', name: 'Roger Wicker', date: 'December 31, 2007'},
  {state: 'Mississippi', party: 'Republican', name: 'Cindy Hyde-Smith', date: 'April 9, 2018'},
  {state: 'Missouri', party: 'Democrat', name: 'Claire McCaskill', date: 'January 3, 2007'},
  {state: 'Missouri', party: 'Republican', name: 'Roy Blunt', date: 'January 3, 2011'},
  {state: 'Montana', party: 'Democrat', name: 'Jon Tester', date: 'January 3, 2007'},
  {state: 'Montana', party: 'Republican', name: 'Steve Daines', date: 'January 3, 2015'},
  {state: 'Nebraska', party: 'Republican', name: 'Deb Fischer', date: 'January 3, 2013'},
  {state: 'Nebraska', party: 'Republican', name: 'Ben Sasse', date: 'January 3, 2015'},
  {state: 'Nevada', party: 'Republican', name: 'Dean Heller', date: 'May 9, 2011'},
  {state: 'Nevada', party: 'Democrat', name: 'Catherine Cortez Masto', date: 'January 3, 2017'},
  {state: 'New Hampshire', party: 'Democrat', name: 'Jeanne Shaheen', date: 'January 3, 2009'},
  {state: 'New Hampshire', party: 'Democrat', name: 'Maggie Hassan', date: 'January 3, 2017'},
  {state: 'New Jersey', party: 'Democrat', name: 'Bob Menendez', date: 'January 18, 2006'},
  {state: 'New Jersey', party: 'Democrat', name: 'Cory Booker', date: 'October 31, 2013'},
  {state: 'New Mexico', party: 'Democrat', name: 'Tom Udall', date: 'January 3, 2009'},
  {state: 'New Mexico', party: 'Democrat', name: 'Martin Heinrich', date: 'January 3, 2013'},
  {state: 'New York', party: 'Democrat', name: 'Chuck Schumer', date: 'January 3, 1999'},
  {state: 'New York', party: 'Democrat', name: 'Kirsten Gillibrand', date: 'January 26, 2009'},
  {state: 'North Carolina', party: 'Republican', name: 'Richard Burr', date: 'January 3, 2005'},
  {state: 'North Carolina', party: 'Republican', name: 'Thom Tillis', date: 'January 3, 2015'},
  {state: 'North Dakota', party: 'Republican', name: 'John Hoeven', date: 'January 3, 2011'},
  {state: 'North Dakota', party: 'Democrat', name: 'Heidi Heitkamp', date: 'January 3, 2013'},
  {state: 'Ohio', party: 'Democrat', name: 'Sherrod Brown', date: 'January 3, 2007'},
  {state: 'Ohio', party: 'Republican', name: 'Rob Portman', date: 'January 3, 2011'},
  {state: 'Oklahoma', party: 'Republican', name: 'Jim Inhofe', date: 'November 17, 1994'},
  {state: 'Oklahoma', party: 'Republican', name: 'James Lankford', date: 'January 3, 2015'},
  {state: 'Oregon', party: 'Democrat', name: 'Ron Wyden', date: 'February 6, 1996'},
  {state: 'Oregon', party: 'Democrat', name: 'Jeff Merkley', date: 'January 3, 2009'},
  {state: 'Pennsylvania', party: 'Democrat', name: 'Bob Casey Jr.', date: 'January 3, 2007'},
  {state: 'Pennsylvania', party: 'Republican', name: 'Pat Toomey', date: 'January 3, 2011'},
  {state: 'Rhode Island', party: 'Democrat', name: 'Jack Reed', date: 'January 3, 1997'},
  {state: 'Rhode Island', party: 'Democrat', name: 'Sheldon Whitehouse', date: 'January 3, 2007'},
  {state: 'South Carolina', party: 'Republican', name: 'Lindsey Graham', date: 'January 3, 2003'},
  {state: 'South Carolina', party: 'Republican', name: 'Tim Scott', date: 'January 2, 2013'},
  {state: 'South Dakota', party: 'Republican', name: 'John Thune', date: 'January 3, 2005'},
  {state: 'South Dakota', party: 'Republican', name: 'Mike Rounds', date: 'January 3, 2015'},
  {state: 'Tennessee', party: 'Republican', name: 'Lamar Alexander', date: 'January 3, 2003'},
  {state: 'Tennessee', party: 'Republican', name: 'Bob Corker', date: 'January 3, 2007'},
  {state: 'Texas', party: 'Republican', name: 'John Cornyn', date: 'December 1, 2002'},
  {state: 'Texas', party: 'Republican', name: 'Ted Cruz', date: 'January 3, 2013'},
  {state: 'Utah', party: 'Republican', name: 'Orrin Hatch', date: 'January 3, 1977'},
  {state: 'Utah', party: 'Republican', name: 'Mike Lee', date: 'January 3, 2011'},
  {state: 'Vermont', party: 'Democrat', name: 'Patrick Leahy', date: 'January 3, 1975'},
  {state: 'Vermont', party: 'Independent', name: 'Bernie Sanders', date: 'January 3, 2007'},
  {state: 'Virginia', party: 'Democrat', name: 'Mark Warner', date: 'January 3, 2009'},
  {state: 'Virginia', party: 'Democrat', name: 'Tim Kaine', date: 'January 3, 2013'},
  {state: 'Washington', party: 'Democrat', name: 'Patty Murray', date: 'January 3, 1993'},
  {state: 'Washington', party: 'Democrat', name: 'Maria Cantwell', date: 'January 3, 2001'},
  {state: 'West Virginia', party: 'Democrat', name: 'Joe Manchin', date: 'November 15, 2010'},
  {state: 'West Virginia', party: 'Republican', name: 'Shelley Moore Capito', date: 'January 3, 2015'},
  {state: 'Wisconsin', party: 'Republican', name: 'Ron Johnson', date: 'January 3, 2011'},
  {state: 'Wisconsin', party: 'Democrat', name: 'Tammy Baldwin', date: 'January 3, 2013'},
  {state: 'Wyoming', party: 'Republican', name: 'Mike Enzi', date: 'January 3, 1997'},
  {state: 'Wyoming', party: 'Republican', name: 'John Barrasso', date: 'June 25, 2007'},
];

const DEMS = senators
  .filter((d) => d.party === 'Democrat')
  .sort((a, b) => {
    return new Date(b.date).getYear() - new Date(a.date).getYear();
  });

const REPUBS = senators
  .filter((d) => d.party === 'Republican')
  .sort((a, b) => {
    return new Date(b.date).getYear() - new Date(a.date).getYear();
  })
  .reverse();

const OTHER = senators
  .filter((d) => d.party === 'Independent')
  .sort((a, b) => {
    return new Date(b.date).getYear() - new Date(a.date).getYear();
  });

const combine = DEMS.concat(OTHER).concat(REPUBS);

const SENATORS_WIDTH = 20;
const SENATORS_HEIGHT = 5;
export const SENATORS = transposeMatrix(
  [...new Array(SENATORS_WIDTH)].map((_, idx) => {
    return combine.slice(idx * SENATORS_HEIGHT, (idx + 1) * SENATORS_HEIGHT);
  }),
).map((row) =>
  row.map((d) => ({
    ...d,
    yearsInOffice: 118 - new Date(d.date).getYear() + 1,
    color: d.party === 'Democrat' ? 'blue' : d.party === 'Republican' ? 'red' : 'purple',
  })),
);
