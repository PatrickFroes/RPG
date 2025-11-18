import React from "react"

export function Button({ 
	onClick, 
	children, 
	variant = "default",
	className = "",
	...props 
}) {
	const baseClasses = "h-12 bg-(--bg-card) text-(--text-primary) text-sm border border-solid border-(--border-color) hover:brightness-125 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center px-4"
	
	const variants = {
		default: "hover:border-cyan-300 hover:shadow-[inset_0_0_10px_#aaa]",
		play: "hover:border-green-500 hover:shadow-[inset_0_0_10px_lime]",
		danger: "hover:border-red-500 hover:shadow-[inset_0_0_10px_red]",
		disabled: "opacity-50 cursor-not-allowed",
	}

	const variantClasses = variants[variant] || variants.default
	const finalClasses = `${baseClasses} ${variantClasses} ${className}`

	return (
		<button 
			onClick={onClick} 
			className={finalClasses}
			{...props}
		>
			{children}
		</button>
	)
}

export function InputNumber({ 
	value, 
	onChange,
	className = "",
	...props 
}) {
	const baseClasses = "border p-1 text-sm"
	const finalClasses = `${baseClasses} ${className}`

	return (
		<input
			type="number"
			value={value}
			onChange={onChange}
			className={finalClasses}
			{...props}
		/>
	)
}