import { LayoutAnimation, LayoutAnimationType, LayoutAnimationProperty, LayoutAnimationConfig} from 'react-native'

export const animate = (duration:number =200, type:LayoutAnimationType = LayoutAnimation.Types.linear, property:LayoutAnimationProperty = LayoutAnimation.Properties.opacity) => {
    const animationConfig = {
        duration: duration,
        create: {
            type: type,
            property: property,
        },
        update: {
            type: LayoutAnimation.Types.easeInEaseOut
        },
        delete: {
            type: type,
            property: property,
        },
    }
    LayoutAnimation.configureNext(animationConfig)
}

export const animateCustom = (config: LayoutAnimationConfig) => {
    LayoutAnimation.configureNext(config)
}