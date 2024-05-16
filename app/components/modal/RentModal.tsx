'use client'

import userRentModal from "@/app/hook/useRentModal"
import Modal from "./Modal"
import { useMemo, useState } from "react"
import Heading from "../Heading"
import { categories } from "../navbar/Categories"
import CategoryInput from "../input/Categoryinput"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"
import Input from "../input/input"
import axios from "axios"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import CountrySelect from "../input/CountrySelect"
import dynamic from "next/dynamic"


enum STEPS {
    CATEGORY = 0,
    LOCATION = 1,
    INFO = 2,
    IMAGES = 3,
    DESCRIPTION = 4,
    PRICE = 5,
}

const RentModal = () => {
    const router = useRouter()
    const rentModal = userRentModal()

    const [step, setStep] = useState(STEPS.CATEGORY)
    const [ isLoading, setIsLoading ] = useState(false)

    const { 
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {
            errors,
        },
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            category: '',
            location: null,
            guestCount:1,
            roomCount: 1,
            bathroomCount: 1,
            imageSrc: '',
            price: 1,
            tittle: '',
            description: ''
        }
    })

    const category = watch('category')
    const location = watch('location')

    const Map = useMemo(() => dynamic(() => import("../Map"),{
        ssr: false
    }), [location])

    const setCustomValue = (id: string, value: any) =>{
        setValue(id, value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch:true,
        })
    }

    const onBack = () => {
        setStep((value) => value - 1)
    }

    const onNext = () => {
        setStep((value) => value + 1)
    }

    const onSubmit : SubmitHandler<FieldValues> = (data) => {
        if (step != STEPS.PRICE) {
            return onNext()
        }

        setIsLoading(true)

        axios.post('/api/listings', data)
        .then(() => {
            toast.success('Listing Created!')
            router.refresh()
            reset()
            setStep(STEPS.CATEGORY)
            rentModal.onClose()
        })
        .catch(()=> {
            toast.error("Something wrong")
        })
        .finally(() => {
            setIsLoading(false)
        })
    }

    const actionLabel = useMemo(() => {
        if(step === STEPS.PRICE){
            return 'Create'
        }
        return 'Next'
    }, [ step ])

    const secondaryActionLabel = useMemo(() => {
        if (step === STEPS.CATEGORY){
            return undefined
        }
        return 'Back'
    }, [ step ])

    let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading 
            title="which of these best describes your place?"
            subtitle="Pick a category"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                {categories.map((item) => (
                    <div key={item.label} className = "col-span-1">
                        <CategoryInput 
                        onClick ={(category) => setCustomValue('category', category)}
                        selected={category === item.label}
                        label ={item.label}
                        icon={item.icon}
                        />
                    </div>
                ))}
            </div>
        </div>
    )

    if (step === STEPS.LOCATION){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading 
                title = "where is your place located"
                subtitle = "help guests find you"
                />
                <CountrySelect
                value={location}
                onChange={(value) => setCustomValue('location', value)}
                />
                <Map 
                    center={location?.latlng}
                />
            </div>
        )
    }

    // if(step === STEPS.INFO){
    //     bodyContent = (
    //         <div className="flex flex-col gap-8">
    //             <Heading 
    //             title="Share some basics about your place"
    //             subtitle="What amenities do you have?"
    //             />
    //             <Counter
    //             title=

    //         </div>
    //     )
    // }
    
    return (
        <Modal 
        isOpen = {rentModal.isOpen}
        onClose = {rentModal.onClose}
        onSubmit = {handleSubmit(onSubmit)}
        actionLabel={actionLabel}
        secondaryActionLabel = {secondaryActionLabel}
        secondaryAction = {step === STEPS.CATEGORY ? undefined : onBack}
        title="Your Home" 
        body={bodyContent}
        />
    )
}

export default RentModal