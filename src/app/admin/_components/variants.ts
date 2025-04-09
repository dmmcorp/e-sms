

export const mainContainerVariants = {
    hidden: { opacity: 0,},
    visible: {
      opacity: 1,
      transition:{
        duration: 0.5,
        staggerChildren: 0.5
      }
    }
  }
export const containerVariants = {
    hidden: { opacity: 0, y:20},
    visible: {
      opacity: 1,
      y:0,
      transition:{
        duration: 0.3,
        staggerChildren: 0.5
      }
    }
  }

export const itemVariants = {
    hidden: { opacity: 0, y:-20, x:100},
    visible: {opacity: 1, y:0, x:0},
  
  }

export const propertyCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
    },
  },
}

export const sidebarVariants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
}