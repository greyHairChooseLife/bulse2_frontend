import React, { useState, useEffect } from 'react';
import { Calendar, Schedule, Identity, Propose } from './component/Parts';
import './App.css';

const today = new Date();

function App() {

	const [ theDay, setTheDay ] = useState<string>(`${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`);
	const [ session, setSession ] = useState<number | undefined>(undefined);

	type identityType = {
		name: string,
		mobileNumber: string
	}

	//type pageModeType = 'logo' | 'readProject' | 'createProject' | 'updateProject' | 'deleteProject'
	//const [ pageMode, setPageMode ] = useState<pageMode>('logo');

	const [ identity, setIdentity ] = useState<identityType | undefined>(undefined);
	const [ isIdentified, setIsIdentified ] = useState<boolean>(false);

	useEffect(() => {
		if(identity !== undefined) setIsIdentified(true);
		else setIsIdentified(false);
	}, [identity])


	return (
		<div className="App">
			<div>
				<Calendar setTheDay={setTheDay}></Calendar>
			</div>
			<div>
				<Schedule theDay={theDay} setSession={setSession}></Schedule>
			</div>
			<div>
				{!isIdentified && <Identity setIdentity={setIdentity}></Identity>}
				{isIdentified && <Propose theDay={theDay} session={session} identity={identity}></Propose>}
			</div>
		</div>
	);
}

export default App;
