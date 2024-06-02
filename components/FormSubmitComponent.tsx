"use client"

import React, { useCallback, useRef, useState, useTransition } from 'react'
import { FormElementInstance, FormElements } from './FormElements'
import { Button } from './ui/button'
import { HiCursorClick } from 'react-icons/hi'
import { toast } from './ui/use-toast'
import { ImSpinner } from 'react-icons/im'
import { SubmitForm } from '@/actions/form'

const FormSubmitComponent = ({ formURL, content }: {
  formURL: string,
  content: FormElementInstance[]
}) => {

  const formValues = useRef<{ [key: string]: string}>({})
  const formErrors = useRef<{ [key: string]: boolean}>({})
  const [renderKey, setRenderKey] = useState(new Date().getTime())

  const [submitted,setSubmitted] = useState(false)

  const [pending,startTransition] = useTransition() 


  const validateForm : () => boolean = useCallback(() => {
      for(const field of content){
        const value = formValues.current[field.id] || ""
        const valid = FormElements[field.type].validate(field,value)

        if(!valid){
          formErrors.current[field.id] = true
        }
      }

      if(Object.keys(formErrors.current).length > 0){
        return false
    }

    return true
  },[content])

  const submitValue = (key: string, value: string) => {
    formValues.current[key] = value
  }
  const submitForm = async () => {
      formErrors.current = {}
      const validForm = validateForm()
      if(!validForm) {
        setRenderKey(new Date().getTime())
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })  
        return
      }

      try {
          const jsonSubmissionData = JSON.stringify(formValues.current)
          await SubmitForm(formURL, jsonSubmissionData)
          setSubmitted(true)
          toast({
            title: "Success",
            description: "Form submitted successfully",
          })
      }

      catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
        })  
      }
      console.log(formValues.current)
  }

  if(submitted)
    return (
      <div className='flex justify-center w-full h-full items-center p-8'>
        <div className='max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl shadow-blue-700 rounded'>
          <h1 className='text-2xl font-bold'>Form submitted successfully</h1>
          <p className='text-muted-foreground'>
            Thank you for submitting the form, you can close this page
          </p>
        </div>
      </div>
    )
  return (
    <div className='flex justify-center w-full h-full items-center p-8'>
      <div key={renderKey} className='max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl shadow-blue-700 rounded'>
        {content.map(e => {
          const FormElement = FormElements[e.type].formComponent;
          return <FormElement 
          key={e.id} 
          elementInstance={e} 
          submitValue={submitValue}
          isInvalid={formErrors.current[e.id]}
          defaultValue={formValues.current[e.id]}
          />
        })}
        <Button className='mt-8' onClick={() => {
          startTransition(submitForm)
        }}
        disabled={pending}>
          {!pending && <><HiCursorClick className='mr-2' />
              Submit
          </>}
          {pending && <ImSpinner className='animate-spin' />}
        </Button>
      </div>
    </div>
  )
}

export default FormSubmitComponent