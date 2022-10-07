import React, { useState, useEffect } from 'react';
import './_.css';
import axios from 'axios';

const api = axios.create({
	baseURL: `http://${process.env.REACT_APP_API_SERVER_HOST}:${process.env.REACT_APP_API_SERVER_PORT}`,
})


interface IcreateProject {
	theDay: string
	session: number | undefined
	identity: {name: string, mobileNumber: string} | undefined
	setPageMode: any
	setUpdateSchedule: any
	updateSchedule: boolean
}
export const CreateProject = (props: IcreateProject) => {
	const defaultValue = {
		theDay: props.theDay,
		subject: '',
		content: '',
	}

	const [ theDay, setTheDay ] = useState(defaultValue.theDay);
	useEffect(() => {setTheDay(props.theDay)}, [props.theDay]);

	const [ subject, setSubject ] = useState(defaultValue.subject);
	const [ content, setContent ] = useState(defaultValue.content);

	const onChangeInput = (e: any) => {
		switch(e.target.name){
			case 'subject':
				setSubject(e.target.value);
				break;
			case 'content':
				setContent(e.target.value);
				break;
		}
	}

	//	identity, theDay, subject, content를 axios통신해서 서버에 저장한다.
	const onSubmitForm = () => {
		const proposed = {
			identity: props.identity,
			subject: subject,
			content: content,
			theDay: theDay,
			session: props.session
		}
		api.post(`/project`, proposed);
		props.setPageMode('readProject');
		props.setUpdateSchedule(!props.updateSchedule);
	}

	return (
		<div className="CreateBox">
			<form onSubmit={(e: any) => {
				e.preventDefault();
				onSubmitForm();
				}}>
				<input placeholder="제목" name="subject" onChange={onChangeInput}></input>
				<textarea placeholder="내용" name="content" onChange={onChangeInput}></textarea>
				<button type='submit'>등록하기</button>
			</form>
		</div>
	)
}


interface IreadProject {
	theDay: string
	session: number | undefined
}
export const ReadProject = (props: IreadProject) => {
	type loadProjectType = {
		subject: string,
		content: string,
		name: string,
		mobileNumber: string
	}
	const [ loadProject, setLoadProject ] = useState<null | loadProjectType>(null);

	useEffect(() => {
		const getProjectAndMatchSession = async () => {
			const result = await api.get(`/project/date`, {params: {theDay: props.theDay}});
			const sessionMatched = result.data.find((ele: any) => ele.session === props.session);

			//	이름 가리기 : 세글자 이하인 경우
			//if(sessionMatched.name.length <=3) sessionMatched.name = sessionMatched.name.split('').filter((ele: any, idx: number) => idx !== 1).join('*');
			if(sessionMatched.name.length <=3) sessionMatched.name = [...sessionMatched.name.split('').slice(0, 1), '*', ...sessionMatched.name.split('').slice(2)].join('');
			//	이름 가리기 : 네글자 이상인 경우
			else sessionMatched.name = [...sessionMatched.name.split('').slice(0, 1), '**', ...sessionMatched.name.split('').slice(3)].join('');
			//	전화번호 끝자리만 표시
			sessionMatched.mobile_number = sessionMatched.mobile_number.split('').slice(-4).join('');

			setLoadProject({subject: sessionMatched.subject, content: sessionMatched.content, name: sessionMatched.name, mobileNumber: sessionMatched.mobile_number})
		}
		getProjectAndMatchSession();
	}, [props.theDay, props.session])

	return (
		<div className="ReadBox">
			<div>
				<div>
					{loadProject?.subject}
				</div>
				<div>
					{loadProject?.content}
				</div>
			</div>
			<div>
				<span>by {loadProject?.name}, </span>
				<span>{loadProject?.mobileNumber}</span>
			</div>
		</div>
	)
}

export const UpdateProject = () => {
	return (
		<div>
			update project component
		</div>
	)
}

export const DeleteProject = () => {
	return (
		<div>
			delete project component
		</div>
	)
}
