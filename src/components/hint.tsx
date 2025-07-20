import { Tooltip, TooltipTrigger, TooltipProvider, TooltipContent } from "@/components/ui/tooltip"

interface HintProps {
    text: string
    side?: "top" | "right" | "bottom" | "left"
    children: React.ReactNode
    align?: "start" | "center" | "end"
}

const Hint = ({text, side = "top", align = "center", children}: HintProps) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent side={side} align={align}>{text}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

export default Hint;