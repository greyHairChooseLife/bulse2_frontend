import React, { useState } from 'react';
import { Calendar, Schedule } from './component/Parts';
import './App.css';

const today = new Date();

function App() {

	const [ theDay, setTheDay ] = useState<string>(`${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`);

	return (
		<div className="App">
		<div>
			<Calendar setTheDay={setTheDay}></Calendar>
		</div>
		<div className="vertical"></div>
		<div>
			<Schedule theDay={theDay}></Schedule>
		</div>
		</div>
	);
}

export default App;
