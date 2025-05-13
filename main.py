from pyscript import document  # pylint: disable=import-error


def main():
    print("Hello World!")

    output_div = document.querySelector("#output")
    output_div.innerText = "Hello World!"


if __name__ == "__main__":
    main()
