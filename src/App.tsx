import React, { useState, useEffect } from 'react';
import { Login } from './component/Parts/Login';
import { Calendar } from './component/Parts/Calendar';
import { Schedule } from './component/Parts/Schedule';
import { GetIdentity, CreateProject, ReadProject, UpdateProject, DeleteProject } from './component/Parts/Propose';
import './App.css';

const today = new Date();

type sessionType = 1 | 2 | 3 | undefined;
type identityType = {
	name: string,
	mobileNumber: string
}
type pageModeType = 'logo' | 'readProject' | 'createProject' | 'updateProject' | 'deleteProject'

function App() {

	const [ theDay, setTheDay ] = useState<string>(`${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`);
	const [ session, setSession ] = useState<sessionType>(undefined);
	const [ pageMode, setPageMode ] = useState<pageModeType>('logo');
	const [ identity, setIdentity ] = useState<identityType | undefined>(undefined);
	const [ isIdentified, setIsIdentified ] = useState<boolean>(false);

	useEffect(() => {
		if(identity !== undefined) setIsIdentified(true);
		else setIsIdentified(false);
	}, [identity])

	useEffect(() => {setPageMode('logo')}, [theDay])
	useEffect(() => {setIsIdentified(false)}, [session])

	//	pageMode에 따라 page(화면 우측의 메인 콘텐츠 제공 영역)에 보여줄 하위 컴포넌트를 생성한다.
	let page: JSX.Element | null = null;
	switch(pageMode){
		case 'logo':
			page = <img src="image/bird.png"/>;
			break;
		case 'readProject':
			page = <ReadProject theDay={theDay} session={session} />
			break;
		case 'createProject':
			if(!isIdentified) page = <GetIdentity setIdentity={setIdentity} session={session} />;
			else page = <CreateProject theDay={theDay} session={session} identity={identity} />;
			break;
		case 'updateProject':
			page = <UpdateProject />
			break;
		case 'deleteProject':
			page = <DeleteProject />
			break;
	}

	return (
		<div className="App">
			<div>
				<Calendar setTheDay={setTheDay} setSession={setSession} setPageMode={setPageMode} pageMode={pageMode} />
			</div>
			<div>
				<Schedule theDay={theDay} setSession={setSession} setPageMode={setPageMode} />
			</div>
			<div>
				{page}
			</div>
			<div className="Login">
				<Login identity={identity} setIdentity={setIdentity} />
			</div>
		</div>
	);
}

export default App;
