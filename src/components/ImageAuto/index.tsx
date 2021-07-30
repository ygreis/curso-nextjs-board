import Image from 'next/image';
import { Container } from './style';

export default function ImageAuto(props) {
  return (
    <Container className={`image-container ${props.classNameContainer || ''}`} w={props.width}>
      <Image src={props.src} alt={props.alt || ''} className={`image ${props.className || ''}`} layout="fill"/>
    </Container>
  )
}