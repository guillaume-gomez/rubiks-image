function Footer() {
  return (
    <footer className="footer items-center p-4 bg-neutral text-neutral-content">
      <aside className="items-center grid-flow-col">
       <p>Made by Guillaume Gomez - 2023</p>
      </aside>
      <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
        <p className="flex items-center">
          Do you want to support ? Give a
          <a href="https://github.com/guillaume-gomez/rubiks-image" className="rating btn btn-sm btn-ghost px-1">
            <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" />
          </a>
          to this project
        </p>
      </nav>
    </footer>
  );
}

export default Footer;
