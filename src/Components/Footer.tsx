import star from '/star.svg';

function Footer() {
  return (
    <footer className="footer sm:footer-horizontal bg-neutral text-neutral-content items-center p-4">
      <aside className="items-center grid-flow-col">
       <p>Made by Guillaume Gomez - (2023 - 2025)</p>
      </aside>
      <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
        <p className="flex items-center">
          Did you enjoyed ? 😊 Give a
          <a href="https://github.com/guillaume-gomez/rubiks-image" className="btn btn-sm btn-ghost px-1">
            <img src={star} alt="a star" width="24px"/>
          </a>
          to this project
        </p>
      </nav>
    </footer>
  );
}

export default Footer;
