'use client'

import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { LikeAbilityData } from '@/services/define'
import { useCreateCharacterData } from '@/store/useCreateCharacterData'


interface LikeLevelItemProps {
	data: LikeAbilityData
}


const renderLevel = ( props: {
	title: string,
	value: string,
	placeholder: string,
	maxLength: number,
	rows: number,
	onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void,
}) => {

	return(
		<div>
			<div className="flex justify-between items-center mb-1">
				<h3 className="block text-sm font-medium text-secondary-400 dark:text-dark-secondary-400">{props.title}</h3>
				<span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
					{props.value?.length || 0}/{props.maxLength}
				</span>
			</div>
			<textarea
				className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 text-sm resize-none"
				id={props.title}
				value={props.value}
				placeholder={props.placeholder}
				rows={props.rows}
				
				maxLength={props.maxLength}
				onChange={props.onChange}
			/>
		</div>
	)
}

export default function LikeLevelItem(props: LikeLevelItemProps) {
	const { data } = props
	const { updateLikeAbilityData } = useCreateCharacterData()

	const lv = data.lv || 0
	const world_list_detail_chrbot_key = data.world_list_detail_chrbot_key || 0

	const [lv_name, setLevelName] = useState(data.lv_name || '')
	const [features, setFeatures] = useState(data.features || '')
	const [rules, setRules] = useState(data.rules || '')


	useEffect(() => {
		updateLikeAbility()
	}, [lv_name, features, rules])

	const updateLikeAbility = () => {
		const newLikeAbility: LikeAbilityData = {
			features,
			lv,
			lv_name,
			rules,
			world_list_detail_chrbot_key
		}

		console.log('update newLikeAbility :: ', newLikeAbility)
		updateLikeAbilityData(newLikeAbility)
	}

	
	return (
		<div className='mb-4'>
			<h3 className="block text-sm text-secondary-700 dark:text-dark-secondary-400 mb-2 font-bold">
				{`LV.${lv}`}
			</h3>
			
			{/* 레벨 이름 */}
			<div className='mb-4'>
				{renderLevel({
					title: '레벨 이름',
					value: lv_name,
					placeholder: '레벨의 이름 또는 간단한 설명을 입력해주세요. 예) 첫 만남',
					maxLength: 25,
					rows: 1,
					onChange: (e) => setLevelName(e.target.value),
				})}
			</div>

			{/* 특징 */}
			<div className='mb-4'>
				{renderLevel({
					title: '특징',
					value: features,
					placeholder: '캐릭터 특징을 입력해 주세요.\n예: {{char}}(은)는 {{user}}(을)를 퉁명스럽게 대한다.',
					maxLength: 1000,
					rows: 7,
					onChange: (e) => setFeatures(e.target.value),
				})}
			</div>

			{/* 호감도 증감규칙 */}
			<div className='mb-4'>
				{renderLevel({
					title: '호감도 증감규칙',
					value: rules,
					placeholder: '- 호감도가 오르고 내리는 규칙을 입력해 주세요\n예: {{char}}의 외모를 칭찬하면 +5, {{char}}의 외모를 비난하면 -5\n- 호감도의 범위는 0~100 이며, 100에 도달하면 레벨이 오릅니다.\n- 프롬프트에 Current {{char}}’s Level, Current {{char}}’s Exp을 입력하면 AI가 레벨과 호감도(경험치)를 인식합니다.',
					maxLength: 1000,
					rows: 7,
					onChange: (e) => setRules(e.target.value),
				})}
			</div>
		</div>
	)
}


