import { useToast } from "@/hooks/use-toast"

export { useToast }

export function Toaster() {
  const { toasts } = useToast()

  return (
    <>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <div key={id} {...props}>
            {title}
            {description}
            {action}
          </div>
        )
      })}
    </>
  )
}
