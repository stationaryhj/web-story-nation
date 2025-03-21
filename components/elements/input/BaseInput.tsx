import React from 'react'

type BaseInputProps = {
  type: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const BaseInput = ({ type, placeholder, value, onChange }: BaseInputProps) => {
  return <input type={type} placeholder={placeholder} value={value} onChange={onChange} />
}
