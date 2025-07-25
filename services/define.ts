export interface LikeAbilityData {
	features: string
	lv: number
	lv_name: string
	rules: string
	world_list_detail_chrbot_key: number
}


export interface PriSignedUrlInfo {
	idx: number
	file_name: string
	file_type: string
}


export interface MultiImageData {
	hash?: string
	isDeleteCondition?: boolean
	
	idx: number
	chrbot_multi_image_key: number
	default_yn: number
	img_url: string
	lv: number
	rules: string
	show_yn: number
	world_list_detail_chrbot_key: number
}


export interface MultiImageDataCustom extends MultiImageData {
	hash?: string
	isDeleteCondition?: boolean
}