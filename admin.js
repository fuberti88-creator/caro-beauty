/* =========================================
   CARÔ BEAUTY
   ÁREA ADMINISTRATIVA
   SUPABASE
========================================= */

const SUPABASE_URL =
    "https://ehxqgrhpgizekwbqrdwp.supabase.co";

const SUPABASE_ANON_KEY =
    "COLE_AQUI_A_MESMA_CHAVE_PUBLICA_DO_SEU_SCRIPT.JS";


/* =========================================
   SENHA DO ADMIN
========================================= */

const SENHA_ADMIN = "caro123";


/* =========================================
   VARIÁVEIS
========================================= */

let supabaseClient = null;
let produtos = [];
let produtoEditando = null;


/* =========================================
   INICIALIZAÇÃO
========================================= */

document.addEventListener("DOMContentLoaded", async function () {

    try {

        await carregarSupabase();
        await carregarProdutos();

    } catch (erro) {

        console.error("Erro ao iniciar:", erro);

    }

});


/* =========================================
   CARREGAR SUPABASE
========================================= */

function carregarSupabase() {

    return new Promise((resolve, reject) => {

        if (typeof window.supabase !== "undefined") {

            supabaseClient =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_ANON_KEY
                );

            resolve();
            return;
        }


        const script =
            document.createElement("script");


        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";


        script.onload = function () {

            try {

                supabaseClient =
                    window.supabase.createClient(
                        SUPABASE_URL,
                        SUPABASE_ANON_KEY
                    );

                resolve();

            } catch (erro) {

                reject(erro);

            }

        };


        script.onerror = function () {

            reject(
                new Error(
                    "Não foi possível carregar o Supabase."
                )
            );

        };


        document.head.appendChild(script);

    });

}


/* =========================================
   LOGIN
========================================= */

function entrarAdmin() {

    const senha =
        document.getElementById("senhaAdmin").value;


    const erro =
        document.getElementById("erroLogin");


    if (senha === SENHA_ADMIN) {

        document.getElementById(
            "telaLogin"
        ).style.display = "none";


        document.getElementById(
            "painelAdmin"
        ).style.display = "block";


        erro.textContent = "";


        carregarProdutos();

    } else {

        erro.textContent =
            "Senha incorreta.";

    }

}


/* =========================================
   ENTER NO LOGIN
========================================= */

document.addEventListener("keydown", function (event) {

    const telaLogin =
        document.getElementById("telaLogin");


    if (
        event.key === "Enter" &&
        telaLogin &&
        telaLogin.style.display !== "none"
    ) {

        entrarAdmin();

    }

});


/* =========================================
   SAIR
========================================= */

function sairAdmin() {

    document.getElementById(
        "painelAdmin"
    ).style.display = "none";


    document.getElementById(
        "telaLogin"
    ).style.display = "flex";


    document.getElementById(
        "senhaAdmin"
    ).value = "";

}


/* =========================================
   CARREGAR PRODUTOS
========================================= */

async function carregarProdutos() {

    if (!supabaseClient) {

        console.error(
            "Supabase não foi carregado."
        );

        return;

    }


    const lista =
        document.getElementById(
            "listaProdutosAdmin"
        );


    if (lista) {

        lista.innerHTML = `

            <div class="nenhum-produto">

                <span>⏳</span>

                <p>
                    Carregando produtos...
                </p>

            </div>

        `;

    }


    try {

        const resposta =
            await supabaseClient
                .from("produtos")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (resposta.error) {

            throw resposta.error;

        }


        produtos =
            resposta.data || [];


        mostrarProdutos();


    } catch (erro) {

        console.error(
            "Erro ao carregar produtos:",
            erro
        );


        if (lista) {

            lista.innerHTML = `

                <div class="nenhum-produto">

                    <span>⚠️</span>

                    <p>
                        Erro ao carregar produtos.
                    </p>

                </div>

            `;

        }

    }

}


/* =========================================
   ABRIR FORMULÁRIO
========================================= */

function abrirFormularioProduto() {

    produtoEditando = null;


    document.getElementById(
        "formularioProduto"
    ).style.display = "block";


    document.getElementById(
        "tituloFormulario"
    ).textContent =
        "Novo produto";


    document.getElementById(
        "formProduto"
    ).reset();


    document.getElementById(
        "estoqueProduto"
    ).value = "true";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   FECHAR FORMULÁRIO
========================================= */

function fecharFormularioProduto() {

    document.getElementById(
        "formularioProduto"
    ).style.display = "none";


    document.getElementById(
        "formProduto"
    ).reset();


    produtoEditando = null;

}


/* =========================================
   SALVAR PRODUTO
========================================= */

async function salvarProduto(event) {

    event.preventDefault();


    const nome =
        document.getElementById(
            "nomeProduto"
        ).value.trim();


    const descricao =
        document.getElementById(
            "descricaoProduto"
        ).value.trim();


    const preco =
        Number(
            document.getElementById(
                "precoProduto"
            ).value
        );


    const categoria =
        document.getElementById(
            "categoriaProduto"
        ).value;


    const estoque =
        document.getElementById(
            "estoqueProduto"
        ).value === "true";


    const arquivo =
        document.getElementById(
            "imagemProduto"
        ).files[0];


    if (!nome) {

        alert(
            "Digite o nome do produto."
        );

        return;

    }


    if (
        isNaN(preco) ||
        preco < 0
    ) {

        alert(
            "Digite um preço válido."
        );

        return;

    }


    let imagem_url = "";


    /*
       Mantém a imagem atual
       quando estiver editando.
    */

    if (produtoEditando) {

        const produtoAtual =
            produtos.find(
                produto =>
                    Number(produto.id) ===
                    Number(produtoEditando)
            );


        if (produtoAtual) {

            imagem_url =
                produtoAtual.imagem_url || "";

        }

    }


    /*
       Nova imagem
    */

    if (arquivo) {

        imagem_url =
            await transformarImagem(
                arquivo
            );

    }


    try {

        /* =========================
           NOVO PRODUTO
        ========================= */

        if (!produtoEditando) {

            const resposta =
                await supabaseClient
                    .from("produtos")
                    .insert([

                        {
                            nome: nome,

                            descricao: descricao,

                            preco: preco,

                            categoria: categoria,

                            imagem_url: imagem_url,

                            estoque: estoque
                        }

                    ]);


            if (resposta.error) {

                throw resposta.error;

            }


            alert(
                "Produto cadastrado com sucesso!"
            );

        }


        /* =========================
           EDITAR PRODUTO
        ========================= */

        else {

            const resposta =
                await supabaseClient
                    .from("produtos")
                    .update({

                        nome: nome,

                        descricao: descricao,

                        preco: preco,

                        categoria: categoria,

                        imagem_url: imagem_url,

                        estoque: estoque

                    })
                    .eq(
                        "id",
                        produtoEditando
                    );


            if (resposta.error) {

                throw resposta.error;

            }


            alert(
                "Produto atualizado com sucesso!"
            );

        }


        produtoEditando = null;


        fecharFormularioProduto();


        await carregarProdutos();


    } catch (erro) {

        console.error(
            "Erro ao salvar:",
            erro
        );


        alert(
            "Não foi possível salvar o produto."
        );

    }

}


/* =========================================
   TRANSFORMAR IMAGEM
========================================= */

function transformarImagem(arquivo) {

    return new Promise((resolve, reject) => {

        const leitor =
            new FileReader();


        leitor.onload = function () {

            resolve(
                leitor.result
            );

        };


        leitor.onerror = function () {

            reject(
                new Error(
                    "Erro ao ler imagem."
                )
            );

        };


        leitor.readAsDataURL(arquivo);

    });

}


/* =========================================
   MOSTRAR PRODUTOS
========================================= */

function mostrarProdutos() {

    const lista =
        document.getElementById(
            "listaProdutosAdmin"
        );


    if (!lista) return;


    lista.innerHTML = "";


    if (produtos.length === 0) {

        lista.innerHTML = `

            <div class="nenhum-produto">

                <span>🛍️</span>

                <p>
                    Nenhum produto cadastrado.
                </p>

            </div>

        `;

        return;

    }


    produtos.forEach(function (produto) {

        const card =
            document.createElement("div");


        card.className =
            "card-admin";


        const imagem =
            produto.imagem_url

                ? `
                    <img
                        src="${produto.imagem_url}"
                        alt="${escaparHTML(produto.nome)}"
                    >
                  `

                : `
                    <div class="sem-imagem-admin">
                        FOTO
                    </div>
                  `;


        const estoque =
            produto.estoque === true;


        const statusClasse =
            estoque
                ? "estoque-ok"
                : "estoque-esgotado";


        const statusTexto =
            estoque
                ? "EM ESTOQUE"
                : "SEM ESTOQUE";


        card.innerHTML = `

            <div class="foto-card-admin">

                ${imagem}

            </div>


            <div class="dados-card-admin">

                <span class="categoria-admin">

                    ${escaparHTML(
                        produto.categoria || ""
                    )}

                </span>


                <h3>

                    ${escaparHTML(
                        produto.nome || ""
                    )}

                </h3>


                <p>

                    ${escaparHTML(
                        produto.descricao ||
                        "Sem descrição"
                    )}

                </p>


                <strong>

                    R$ ${formatarPreco(
                        produto.preco
                    )}

                </strong>


                <div
                    class="status-admin ${statusClasse}"
                >

                    ${statusTexto}

                </div>


                <div class="acoes-admin">

                    <button
                        onclick="editarProduto(${produto.id})"
                        class="botao-editar"
                    >
                        EDITAR
                    </button>


                    <button
                        onclick="alternarEstoque(${produto.id})"
                        class="botao-estoque"
                    >

                        ${
                            estoque
                                ? "SEM ESTOQUE"
                                : "ATIVAR ESTOQUE"
                        }

                    </button>


                    <button
                        onclick="excluirProduto(${produto.id})"
                        class="botao-excluir"
                    >
                        EXCLUIR
                    </button>

                </div>

            </div>

        `;


        lista.appendChild(card);

    });

}


/* =========================================
   EDITAR
========================================= */

function editarProduto(id) {

    const produto =
        produtos.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!produto) {

        alert(
            "Produto não encontrado."
        );

        return;

    }


    produtoEditando =
        produto.id;


    document.getElementById(
        "formularioProduto"
    ).style.display = "block";


    document.getElementById(
        "tituloFormulario"
    ).textContent =
        "Editar produto";


    document.getElementById(
        "nomeProduto"
    ).value =
        produto.nome || "";


    document.getElementById(
        "descricaoProduto"
    ).value =
        produto.descricao || "";


    document.getElementById(
        "precoProduto"
    ).value =
        produto.preco || "";


    document.getElementById(
        "categoriaProduto"
    ).value =
        produto.categoria || "";


    document.getElementById(
        "estoqueProduto"
    ).value =
        produto.estoque
            ? "true"
            : "false";


    document.getElementById(
        "imagemProduto"
    ).value = "";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   ALTERAR ESTOQUE
========================================= */

async function alternarEstoque(id) {

    const produto =
        produtos.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!produto) return;


    const novoEstoque =
        !produto.estoque;


    try {

        const resposta =
            await supabaseClient
                .from("produtos")
                .update({

                    estoque:
                        novoEstoque

                })
                .eq(
                    "id",
                    id
                );


        if (resposta.error) {

            throw resposta.error;

        }


        produto.estoque =
            novoEstoque;


        mostrarProdutos();


    } catch (erro) {

        console.error(
            "Erro ao alterar estoque:",
            erro
        );


        alert(
            "Não foi possível alterar o estoque."
        );

    }

}


/* =========================================
   EXCLUIR
========================================= */

async function excluirProduto(id) {

    const produto =
        produtos.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!produto) return;


    const confirmar =
        confirm(
            `Deseja realmente excluir "${produto.nome}"?`
        );


    if (!confirmar) return;


    try {

        const resposta =
            await supabaseClient
                .from("produtos")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (resposta.error) {

            throw resposta.error;

        }


        produtos =
            produtos.filter(
                item =>
                    Number(item.id) !==
                    Number(id)
            );


        mostrarProdutos();


    } catch (erro) {

        console.error(
            "Erro ao excluir:",
            erro
        );


        alert(
            "Não foi possível excluir o produto."
        );

    }

}


/* =========================================
   FORMATAR PREÇO
========================================= */

function formatarPreco(valor) {

    return Number(
        valor || 0
    ).toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


/* =========================================
   SEGURANÇA DO TEXTO
========================================= */

function escaparHTML(texto) {

    return String(
        texto || ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
