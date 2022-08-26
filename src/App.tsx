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

	type pageModeType = 'logo' | 'readProject' | 'createProject' | 'updateProject' | 'deleteProject'
	const [ pageMode, setPageMode ] = useState<pageModeType>('logo');

	const [ identity, setIdentity ] = useState<identityType | undefined>(undefined);
	const [ isIdentified, setIsIdentified ] = useState<boolean>(false);

	useEffect(() => {
		if(identity !== undefined) setIsIdentified(true);
		else setIsIdentified(false);
	}, [identity])

	useEffect(() => {setPageMode('logo')}, [theDay])

	//	pageMode에 따라 page(화면 우측의 메인 콘텐츠 제공 영역)에 보여줄 하위 컴포넌트를 생성한다.
	let page: JSX.Element | null = null;
	switch(pageMode){
		case 'logo':
			page = <img src="image/bird.png"/>;
			break;
		case 'readProject':
			page = <div>read Project Component</div>;
			break;
		case 'createProject':
			if(!isIdentified) page = <Identity setIdentity={setIdentity} />;
			else page = <Propose theDay={theDay} session={session} identity={identity} />;
			break;
		case 'updateProject':
			page = <div>update Project Component</div>;
			break;
		case 'deleteProject':
			page = <div>delete Project Component</div>;
			break;
	}

	return (
		<div className="App">
			<div>
				<Calendar setTheDay={setTheDay}></Calendar>
			</div>
			<div>
				<Schedule theDay={theDay} setSession={setSession} setPageMode={setPageMode}></Schedule>
			</div>
			<div>
				{page}
			</div>
		</div>
	);
}

export default App;
